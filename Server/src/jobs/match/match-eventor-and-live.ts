import { format } from 'date-fns';
import { and, eq, or } from 'drizzle-orm';
import {
  EventorCompetitionsTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
} from 'lib/db/schema';
import { EventorExtractor } from 'lib/eventor/extractor';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class MatchEventorAndLiveJob {
  private api: APIResponse;
  private threshold = 2;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    // ToDo: Add where based on relationship with OLCompetition
    const eventorCompetitions = await this.api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable);

    // ToDo: Add where based on relationship with OLCompetition
    const liveCompetitions = await this.api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable);

    // Match Eventor competitions with Live competitions
    // for (const liveCompetition of liveCompetitions) {
    //   for (const eventorCompetition of eventorCompetitions) {
    //     const weight = this.getWeight(liveCompetition, eventorCompetition);
    //     const match = weight.weight >= this.threshold;

    //     if (existing) {
    //       await this.api.Drizzle.db.update(OLCompetitionsTable).set({
    //         eventorId: eventorCompetition.id.toString(),
    //         liveId: liveCompetition.id,
    //       });
    //     } else {
    //       await this.api.Drizzle.db.insert(OLCompetitionsTable).values({
    //         eventorId: eventorCompetition.id.toString(),
    //         liveId: liveCompetition.id,
    //       });
    //     }
    //   }
    //}

    console.log('Eventor and Live competitions matched successfully.');
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
      return undefined;
    }

    const [existing] = await this.api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(whereClause)
      .limit(1);

    return existing;
  }

  private getWeight(
    liveCompetition: typeof LiveCompetitionsTable.$inferSelect,
    eventorCompetition: typeof EventorCompetitionsTable.$inferSelect,
  ) {
    return EventorExtractor.weighItem(
      {
        name: liveCompetition.name,
        organizer: liveCompetition.organizer,
        date:
          liveCompetition.date instanceof Date
            ? format(liveCompetition.date, 'yyyy-MM-dd')
            : String(liveCompetition.date),
      },
      {
        id: String(eventorCompetition.id),
        name: eventorCompetition.name,
        date: eventorCompetition.date
          ? eventorCompetition.date instanceof Date
            ? format(eventorCompetition.date, 'yyyy-MM-dd')
            : String(eventorCompetition.date)
          : undefined,
        club: eventorCompetition.organizer,
      },
    );
  }
}
