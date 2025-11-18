import * as cron from 'node-cron';
import { IncomingWebhook } from '@slack/webhook';
import { getEnv } from 'lib/helpers/env';
import axios from 'axios';
import { LiveresultatUrl } from 'lib/eventor/scrapers/urls';
import { ServiceStatusTable } from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { eq } from 'drizzle-orm/sql/expressions/conditions';

const api = apiSingletons.createApiSingletons();

const DEV = getEnv('env') !== 'live';

interface HealthCheck {
  name: string;
  query: () => Promise<boolean>;
}

export class OLSelfHelper {
  private webhook: IncomingWebhook | undefined;
  private alertTimestamps: number[] = [];
  private readonly MAX_ALERTS_PER_HOUR = 4;
  private readonly ONE_HOUR_MS = 60 * 60 * 1000;
  private throttleNotificationSent = false;

  constructor() {
    if (!process.env.SLACK_WEBHOOK) {
      console.warn('No SLACK_WEBHOOK defined for self helper!');
    } else {
      this.webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK, {
        icon_emoji: ':interrobang:',
      });
    }
  }

  public start = () => {
    const schedule = DEV ? '* * * * *' : '*/15 * * * *';
    cron.schedule(schedule, this.internalHealthchecks);
    cron.schedule(schedule, this.externalHealthchecks);
    setTimeout(this.internalHealthchecks, DEV ? 1000 : 5000);
    setTimeout(this.externalHealthchecks, DEV ? 1000 : 5000);
  };

  private externalHealthchecks = async () => {
    const checks: HealthCheck[] = [
      {
        name: LiveresultatUrl,
        query: async () => {
          const res = await axios.get(LiveresultatUrl);
          return res.status === 200;
        },
      },
      // Enable these when Eventor will be supported
      // {
      //   name: EventorUrls.se,
      //   query: async () => {
      //     const res = await axios.get(EventorUrls.se);
      //     return res.status === 200;
      //   },
      // },
      // {
      //   name: EventorUrls.au,
      //   query: async () => {
      //     const res = await axios.get(EventorUrls.au);
      //     return res.status === 200;
      //   },
      // },
      // {
      //   name: EventorUrls.no,
      //   query: async () => {
      //     const res = await axios.get(EventorUrls.no);
      //     return res.status === 200;
      //   },
      // },
    ];

    for (const check of checks) {
      const [current] = await api.Drizzle.db
        .select()
        .from(ServiceStatusTable)
        .where(eq(ServiceStatusTable.id, check.name))
        .limit(1);

      if (!current) {
        await api.Drizzle.db
          .insert(ServiceStatusTable)
          .values({ id: check.name, status: true });
      }

      try {
        const res = await check.query();
        if (!res) {
          throw new Error(`Query succeded but response data was invalid.`);
        }
        if (current?.status === false) {
          await api.Drizzle.db
            .update(ServiceStatusTable)
            .set({ status: true })
            .where(eq(ServiceStatusTable.id, check.name));
        }
      } catch {
        if (current?.status === true) {
          api.Drizzle.db
            .update(ServiceStatusTable)
            .set({ status: false })
            .where(eq(ServiceStatusTable.id, check.name));
        }
      }
    }
  };

  private internalHealthchecks = async () => {
    const checks: HealthCheck[] = [
      {
        name: 'GetCompetitions',
        query: async () => {
          const res = await axios.get('http://localhost:3000/v2/competitions');
          return res.data.status === 'success';
        },
      },
      {
        name: 'GetSingleCompetition',
        query: async () => {
          const res = await axios.get(
            'http://localhost:3000/v2/competitions/2025-11-02~hostlunken2025~snattringesk',
          );
          return res.data.status === 'success';
        },
      },
      {
        name: 'GetResults',
        query: async () => {
          const res = await axios.get(
            `http://localhost:3000/v2/results/live/a0836661d2dbafc0e8e0140d8c401328?sortingKey=place&sortingDirection=asc&nowTimestamp=1&uid=3wy9kewRdMt8VPfPaZUZ6`,
          );

          if (res.data.status !== 'success') {
            return false;
          }

          if (res.data.data.className !== 'Herrar 10 km') {
            return false;
          }

          return true;
        },
      },
    ];

    const errors = [];

    for (const check of checks) {
      try {
        console.info(`Test: running ${check.name}`);
        const res = await check.query();
        if (!res) {
          throw new Error(`Query succeded but response data was invalid.`);
        }
        console.info(`Test: success ${check.name}`);
      } catch (err: any) {
        errors.push({ name: check.name, error: err?.message || err });
      }
    }

    if (errors.length) {
      this.alert(errors);
    }
  };

  private canSendAlert = (): boolean => {
    const now = Date.now();
    const oneHourAgo = now - this.ONE_HOUR_MS;

    // Remove timestamps older than 1 hour (sliding window)
    this.alertTimestamps = this.alertTimestamps.filter(
      timestamp => timestamp > oneHourAgo,
    );

    // Check if we're under the limit
    if (this.alertTimestamps.length < this.MAX_ALERTS_PER_HOUR) {
      this.alertTimestamps.push(now);
      this.throttleNotificationSent = false;
      return true;
    }

    return false;
  };

  private alert = async (errors: any[]) => {
    if (!this.webhook) {
      console.error(errors);
      return;
    }

    // Check if we can send this alert
    if (!this.canSendAlert()) {
      if (!this.throttleNotificationSent) {
        // Send one notification that we're throttling
        this.throttleNotificationSent = true;
        console.warn(
          `Alert throttled: ${errors.length} error(s) suppressed. Max ${this.MAX_ALERTS_PER_HOUR} alerts/hour reached.`,
        );
        await this.webhook.send({
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `⚠️ *LiveOL Alert Throttling Active*\n\nMax ${this.MAX_ALERTS_PER_HOUR} alerts per hour reached. Further alerts will be suppressed until the rate limit resets.\n\nLast error count: ${errors.length}`,
              },
            },
          ],
        });
      } else {
        console.warn(
          `Alert suppressed: ${errors.length} error(s). Rate limit active.`,
        );
      }
      return;
    }

    await this.webhook.send({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${errors.length} LiveOL error(s):`,
          },
        },
        ...errors.map(err => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```' + this.forceStringify(err) + '```',
            },
          };
        }),
      ],
    });
  };

  private forceStringify = (error: any): string => {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };
}
