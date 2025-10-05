import { format } from 'date-fns';
import { eq, or, isNull } from 'drizzle-orm';
import {
  EventorCompetitionsTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
} from 'lib/db/schema';
import { EventorExtractor } from 'lib/eventor/extractor';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class MatchEventorAndLiveJob {
  private api: APIResponse;
  // How many checks need to be true for a match
  private threshold = 2;

  constructor(
    private liveId: number | undefined = undefined,
    private eventorId: string | undefined = undefined,
  ) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    // If only liveId is provided, find matching eventor competition.
    if (this.liveId !== undefined && this.eventorId === undefined) {
      const [liveCompetition] = await this.api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(eq(LiveCompetitionsTable.id, this.liveId))
        .limit(1);

      if (!liveCompetition) {
        throw new Error(`Live competition with ID ${this.liveId} not found.`);
      }

      const eventorCompetitions = await this.api.Drizzle.db
        .select()
        .from(OLCompetitionsTable)
        .where(isNull(OLCompetitionsTable.liveId))
        .leftJoin(
          EventorCompetitionsTable,
          eq(OLCompetitionsTable.eventorId, EventorCompetitionsTable.eventorId),
        );

      let matchCount = 0;

      for (const row of eventorCompetitions) {
        if (!row.eventor_competitions) {
          continue;
        }

        const weight = this.getWeight(
          liveCompetition,
          row.eventor_competitions,
        );
        const match = weight.weight >= this.threshold;

        if (match && matchCount === 0) {
          matchCount++;

          const existing = await this.findOLCompetition({
            liveId: liveCompetition.id,
            eventorId: row.eventor_competitions.eventorId,
          });

          if (existing.length) {
            for (const ex of existing) {
              await this.api.Drizzle.db
                .delete(OLCompetitionsTable)
                .where(eq(OLCompetitionsTable.id, ex.id));
            }
          }

          await this.api.Drizzle.db.insert(OLCompetitionsTable).values({
            eventorId: row.eventor_competitions.eventorId,
            liveId: liveCompetition.id,
          });

          console.log('Eventor and Live competitions matched successfully.');
        }
      }

      if (matchCount === 0) {
        await this.api.Drizzle.db
          .insert(OLCompetitionsTable)
          .values({
            eventorId: undefined,
            liveId: liveCompetition.id,
          })
          .onConflictDoNothing();
      }
    }

    // If only eventorId is provided, find matching live competition.
    if (this.eventorId !== undefined && this.liveId === undefined) {
      const [eventorCompetition] = await this.api.Drizzle.db
        .select()
        .from(EventorCompetitionsTable)
        .where(eq(EventorCompetitionsTable.eventorId, this.eventorId))
        .limit(1);

      if (!eventorCompetition) {
        throw new Error(
          `Eventor competition with ID ${this.eventorId} not found.`,
        );
      }

      const liveCompetitions = await this.api.Drizzle.db
        .select()
        .from(OLCompetitionsTable)
        .where(isNull(OLCompetitionsTable.eventorId))
        .leftJoin(
          LiveCompetitionsTable,
          eq(OLCompetitionsTable.liveId, LiveCompetitionsTable.id),
        );

      let matchCount = 0;

      for (const row of liveCompetitions) {
        if (!row.live_competitions) {
          continue;
        }

        const weight = this.getWeight(
          row.live_competitions,
          eventorCompetition,
        );
        const match = weight.weight >= this.threshold;

        if (match && matchCount === 0) {
          matchCount++;

          const existing = await this.findOLCompetition({
            liveId: row.live_competitions.id,
            eventorId: eventorCompetition.eventorId,
          });

          if (existing.length) {
            for (const ex of existing) {
              await this.api.Drizzle.db
                .delete(OLCompetitionsTable)
                .where(eq(OLCompetitionsTable.id, ex.id));
            }
          }

          await this.api.Drizzle.db.insert(OLCompetitionsTable).values({
            eventorId: eventorCompetition.eventorId,
            liveId: row.live_competitions.id,
          });

          console.log('Eventor and Live competitions matched successfully.');
        }
      }

      if (matchCount === 0) {
        await this.api.Drizzle.db
          .insert(OLCompetitionsTable)
          .values({
            eventorId: eventorCompetition.eventorId,
            liveId: undefined,
          })
          .onConflictDoNothing();
      }
    }

    // If neither liveId nor eventorId is provided, throw an error.
    if (this.liveId === undefined && this.eventorId === undefined) {
      throw new Error(
        'Either liveId or eventorId must be provided to match competitions.',
      );
    }

    // If both liveId and eventorId are provided, match them.
    if (this.liveId !== undefined && this.eventorId !== undefined) {
      const [eventorCompetition] = await this.api.Drizzle.db
        .select()
        .from(EventorCompetitionsTable)
        .where(eq(EventorCompetitionsTable.eventorId, this.eventorId))
        .limit(1);

      if (!eventorCompetition) {
        throw new Error(
          `Eventor competition with ID ${this.eventorId} not found.`,
        );
      }

      const [liveCompetition] = await this.api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(eq(LiveCompetitionsTable.id, this.liveId))
        .limit(1);

      if (!liveCompetition) {
        throw new Error(`Live competition with ID ${this.liveId} not found.`);
      }

      const existing = await this.findOLCompetition({
        liveId: liveCompetition.id,
        eventorId: eventorCompetition.eventorId,
      });

      if (existing) {
        await this.api.Drizzle.db.update(OLCompetitionsTable).set({
          eventorId: eventorCompetition.eventorId,
          liveId: liveCompetition.id,
        });
      } else {
        await this.api.Drizzle.db.insert(OLCompetitionsTable).values({
          eventorId: eventorCompetition.eventorId,
          liveId: liveCompetition.id,
        });
      }

      console.log('Eventor and Live competitions matched successfully.');
    }
  }

  private async findOLCompetition({
    eventorId,
    liveId,
  }: {
    liveId: number | null;
    eventorId: string | null;
  }) {
    let whereClause = null;

    if (eventorId && liveId) {
      whereClause = or(
        eq(OLCompetitionsTable.eventorId, eventorId),
        eq(OLCompetitionsTable.liveId, liveId),
      );
    } else if (eventorId) {
      whereClause = eq(OLCompetitionsTable.eventorId, eventorId);
    } else if (liveId) {
      whereClause = eq(OLCompetitionsTable.liveId, liveId);
    }

    if (whereClause === null) {
      return [];
    }

    const existing = await this.api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(whereClause);

    return existing;
  }

  private getWeight(
    liveCompetition: typeof LiveCompetitionsTable.$inferSelect,
    eventorCompetition: typeof EventorCompetitionsTable.$inferSelect,
  ) {
    // Helper to remove special characters and normalize strings
    const normalize = (str: string) =>
      str.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();

    return EventorExtractor.weighItem(
      {
        name: normalize(liveCompetition.name),
        organizer: normalize(liveCompetition.organizer),
        date:
          liveCompetition.date instanceof Date
            ? format(liveCompetition.date, 'yyyy-MM-dd')
            : String(liveCompetition.date),
      },
      {
        id: String(eventorCompetition.id),
        name: normalize(eventorCompetition.name),
        date: eventorCompetition.date
          ? eventorCompetition.date instanceof Date
            ? format(eventorCompetition.date, 'yyyy-MM-dd')
            : String(eventorCompetition.date)
          : undefined,
        club: normalize(eventorCompetition.organizer),
      },
    );
  }
}
