import { and, eq, isNull } from 'drizzle-orm';
import { EventorCompetitionsTable, OLOrganizationsTable } from 'lib/db/schema';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class MatchEventorAndOrganizer {
  private api: APIResponse;

  constructor(private eventorId: string) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    const [eventorCompetition] = await this.api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(
        and(
          eq(EventorCompetitionsTable.eventorId, this.eventorId),
          isNull(EventorCompetitionsTable.olOrganizerId),
        ),
      )
      .limit(1);

    if (!eventorCompetition) {
      console.log(
        `Eventor competition with ID ${this.eventorId} not found or already matched.`,
      );
      return;
    }

    const organizers = await this.api.Drizzle.db
      .select({
        eventorId: OLOrganizationsTable.eventorId,
        eventorName: OLOrganizationsTable.eventorName,
        id: OLOrganizationsTable.id,
      })
      .from(OLOrganizationsTable);

    let matchedOrganizer = organizers.find(
      org =>
        org.eventorName &&
        org.eventorName.toLowerCase().trim() ===
          eventorCompetition.organizer.toLowerCase().trim(),
    );

    if (!matchedOrganizer) {
      // Insert a new organizer if not found
      const insertResult = await this.api.Drizzle.db
        .insert(OLOrganizationsTable)
        .values({
          eventorId: eventorCompetition.eventorId,
          eventorName: eventorCompetition.organizer,
        })
        .returning({
          id: OLOrganizationsTable.id,
          eventorName: OLOrganizationsTable.eventorName,
          eventorId: OLOrganizationsTable.eventorId,
        });

      matchedOrganizer = insertResult[0]!;

      console.log(
        `Inserted new organizer with eventorName "${eventorCompetition.organizer}" and id ${matchedOrganizer.id}.`,
      );
    }

    await this.api.Drizzle.db
      .update(EventorCompetitionsTable)
      .set({ olOrganizerId: matchedOrganizer.id })
      .where(eq(EventorCompetitionsTable.id, eventorCompetition.id));

    console.log(
      `Associated competition ${eventorCompetition.eventorId} with organizer ${matchedOrganizer.id}.`,
    );
  }
}
