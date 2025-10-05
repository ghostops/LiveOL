import { and, eq, isNull } from 'drizzle-orm';
import { LiveCompetitionsTable, OLOrganizationsTable } from 'lib/db/schema';
import { APIResponse, apiSingletons } from 'lib/singletons';
import levenshtein from 'js-levenshtein';

export class MatchLiveAndOrganizer {
  private api: APIResponse;

  constructor(private competitionId: number) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    const [liveCompetition] = await this.api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable)
      .where(
        and(
          eq(LiveCompetitionsTable.id, this.competitionId),
          isNull(LiveCompetitionsTable.olOrganizerId),
        ),
      )
      .limit(1);

    if (!liveCompetition) {
      console.log(
        `Live competition with ID ${this.competitionId} not found or already matched.`,
      );
      return;
    }

    const organizers = await this.api.Drizzle.db
      .select()
      .from(OLOrganizationsTable);

    let matchedOrganizer = organizers.find(org => {
      if (org.liveName) {
        return (
          levenshtein(
            org.liveName.toLowerCase().trim(),
            liveCompetition.organizer.toLowerCase().trim(),
          ) <= 2
        );
      }

      if (org.eventorName) {
        return (
          levenshtein(
            org.eventorName.toLowerCase().trim(),
            liveCompetition.organizer.toLowerCase().trim(),
          ) <= 2
        );
      }

      return false;
    });

    if (!matchedOrganizer) {
      // Insert a new organizer if not found
      const insertResult = await this.api.Drizzle.db
        .insert(OLOrganizationsTable)
        .values({ liveName: liveCompetition.organizer })
        .returning();

      matchedOrganizer = insertResult[0]!;

      console.log(
        `Inserted new organizer with liveName "${liveCompetition.organizer}" and id ${matchedOrganizer.id}.`,
      );
    } else if (!matchedOrganizer.liveName) {
      await this.api.Drizzle.db
        .update(OLOrganizationsTable)
        .set({ liveName: liveCompetition.organizer })
        .where(eq(OLOrganizationsTable.id, matchedOrganizer.id));
    }

    await this.api.Drizzle.db
      .update(LiveCompetitionsTable)
      .set({ olOrganizerId: matchedOrganizer.id })
      .where(eq(LiveCompetitionsTable.id, liveCompetition.id));

    console.log(
      `Associated competition ${liveCompetition.id} with organizer ${matchedOrganizer.id}.`,
    );
  }
}
