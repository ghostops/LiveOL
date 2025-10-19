import { APIResponse, apiSingletons } from 'lib/singletons';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import {
  EventorCompetitionsTable,
  EventorStartTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import { ClassId, OrganizationId, RunnerId } from 'lib/match/generateIds';
import logger from 'lib/logger';
import {
  EventorStart,
  EventorStartsScraper,
} from 'lib/eventor/scrapers/starts';

export class SyncEventorStartsJob {
  private scraper: EventorStartsScraper | null = null;
  private api: APIResponse;

  constructor(private eventorDatabaseId: number) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    const [competition] = await this.api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(eq(EventorCompetitionsTable.id, this.eventorDatabaseId))
      .limit(1);

    if (!competition) {
      throw new Error(
        `Eventor competition with database ID ${this.eventorDatabaseId} not found.`,
      );
    }

    this.scraper = new EventorStartsScraper(
      competition.countryCode,
      competition.eventorId,
    );

    const results = await this.scraper.fetchResults();

    for (const result of results) {
      await this.insertEventorStart(result);
    }

    logger.info(
      `Eventor start times for event ${this.eventorDatabaseId} synced successfully.`,
    );
  }

  private async insertEventorStart(result: EventorStart) {
    const startCompositeId = `${result.className}-${result.name}-${result.club}-${result.startTime}`;
    const hashedSignupId = crypto
      .createHash('md5')
      .update(startCompositeId)
      .digest('hex');

    const body: typeof EventorStartTable.$inferInsert = {
      startId: hashedSignupId,
      eventorDatabaseId: this.eventorDatabaseId,
      name: result.name,
      organization: result.club,
      olClassId: new ClassId().generateId({
        className: result.className,
      }),
      olOrganizationId: new OrganizationId().generateId({
        organizationName: result.club,
      }),
      olRunnerId: new RunnerId().generateId({
        fullName: result.name,
        organizationName: result.club,
        className: result.className,
      }),
      startTime: result.startTime,
    };

    let [runner] = await this.api.Drizzle.db
      .select()
      .from(EventorStartTable)
      .where(eq(EventorStartTable.startId, hashedSignupId))
      .limit(1);

    if (runner) {
      await this.api.Drizzle.db
        .update(EventorStartTable)
        .set(body)
        .where(eq(EventorStartTable.startId, hashedSignupId));
    } else {
      [runner] = await this.api.Drizzle.db
        .insert(EventorStartTable)
        .values({ ...body })
        .returning();
    }

    await this.api.Drizzle.db
      .insert(OLOrganizationsTable)
      .values({
        id: body.olOrganizationId,
      })
      .onConflictDoNothing();

    await this.api.Drizzle.db
      .insert(OLRunnersTable)
      .values({
        id: body.olRunnerId,
      })
      .onConflictDoNothing();
  }
}
