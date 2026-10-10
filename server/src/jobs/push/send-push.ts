import { and, inArray, ne } from 'drizzle-orm';
import {
  LiveCompetitionsTable,
  OLPushTokensTable,
  OLTrackingTable,
  OLUsersTable,
} from 'lib/db/schema';
import {
  effectiveEvents,
  partitionTracking,
  resolveNotificationPrefs,
} from 'lib/entitlements';
import { EVENT_PRIORITY } from 'lib/notifications/detect';
import { sendToTokens } from 'lib/notifications/fcm';
import { buildMessage } from 'lib/notifications/messages';
import type { PushEvent } from 'lib/notifications/notifier';
import { isWithinQuietHours } from 'lib/notifications/quiet-hours';
import { invalidateTrackedIndex } from 'lib/notifications/tracked-index';
import logger from 'lib/logger';
import { APIResponse, apiSingletons } from 'lib/singletons';

export const androidChannelId = (type: PushEvent['type']) => `results_${type}`;

export class SendPushJob {
  private api: APIResponse;

  constructor(private events: PushEvent[]) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    const db = this.api.Drizzle.db;
    const userIds = [
      ...new Set(this.events.flatMap(e => e.subscribers.map(s => s.userId))),
    ];
    if (userIds.length === 0) return;

    const [users, tokens, tracking, competitions] = await Promise.all([
      db.select().from(OLUsersTable).where(inArray(OLUsersTable.id, userIds)),
      db
        .select()
        .from(OLPushTokensTable)
        .where(
          and(
            inArray(OLPushTokensTable.olUserId, userIds),
            ne(OLPushTokensTable.permissionStatus, 'denied'),
          ),
        ),
      db
        .select()
        .from(OLTrackingTable)
        .where(inArray(OLTrackingTable.olUserId, userIds)),
      db
        .select({
          id: LiveCompetitionsTable.id,
          name: LiveCompetitionsTable.name,
          olCompetitionId: LiveCompetitionsTable.olCompetitionId,
        })
        .from(LiveCompetitionsTable)
        .where(
          inArray(LiveCompetitionsTable.id, [
            ...new Set(this.events.map(e => e.liveCompetitionId)),
          ]),
        ),
    ]);

    const competitionById = new Map(competitions.map(c => [c.id, c]));
    const deadTokens: string[] = [];
    let sent = 0;

    for (const user of users) {
      const userTokens = tokens
        .filter(t => t.olUserId === user.id)
        .map(t => t.token);
      if (userTokens.length === 0) continue;

      const prefs = resolveNotificationPrefs(user);
      // Quiet hours are a Plus setting; ignored if Plus has lapsed
      if (
        user.hasPlus &&
        prefs.quietHours &&
        isWithinQuietHours(prefs.quietHours)
      ) {
        continue;
      }

      // Re-check entitlements at send time: Plus may have lapsed since indexing
      const { active } = partitionTracking(
        user,
        tracking.filter(t => t.olUserId === user.id),
      );
      const activeById = new Map(active.map(t => [t.id, t]));

      // One notification per runner per sync: keep the most important event
      const chosen = new Map<
        string,
        { event: PushEvent; trackingId: number }
      >();
      for (const event of this.events) {
        for (const sub of event.subscribers) {
          if (sub.userId !== user.id) continue;
          const row = activeById.get(sub.trackingId);
          if (!row || !effectiveEvents(user, row).includes(event.type))
            continue;

          const current = chosen.get(event.liveResultId);
          if (
            !current ||
            EVENT_PRIORITY.indexOf(event.type) <
              EVENT_PRIORITY.indexOf(current.event.type)
          ) {
            chosen.set(event.liveResultId, { event, trackingId: row.id });
          }
        }
      }

      for (const { event, trackingId } of chosen.values()) {
        const competition = competitionById.get(event.liveCompetitionId);
        const { title, body } = buildMessage(
          event,
          user.language,
          competition?.name ?? null,
        );

        try {
          const result = await sendToTokens(userTokens, {
            notification: { title, body },
            data: {
              type: event.type,
              liveResultId: event.liveResultId,
              liveClassId: event.liveClassId,
              liveCompetitionId: String(event.liveCompetitionId),
              olCompetitionId: competition?.olCompetitionId ?? '',
              className: event.className,
              trackingId: String(trackingId),
            },
            android: {
              notification: {
                channelId: androidChannelId(event.type),
                tag: event.liveResultId,
                icon: 'ic_notification',
              },
            },
            apns: {
              headers: { 'apns-collapse-id': event.liveResultId.slice(0, 64) },
              payload: { aps: { sound: 'default' } },
            },
          });
          sent += result.sent;
          deadTokens.push(...result.deadTokens);
        } catch (error) {
          logger.error(`Push: failed sending to user ${user.id}: ${error}`);
        }
      }
    }

    if (deadTokens.length > 0) {
      await db
        .delete(OLPushTokensTable)
        .where(inArray(OLPushTokensTable.token, deadTokens));
      await invalidateTrackedIndex(this.api.Redis);
    }

    logger.info(
      `Push: ${this.events.length} events, ${sent} sent, ${deadTokens.length} dead tokens removed`,
    );
  }
}
