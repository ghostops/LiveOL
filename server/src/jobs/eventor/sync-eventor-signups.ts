import { eq } from 'drizzle-orm';
import {
  EventorCompetitionsTable,
  EventorSignupsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import {
  EventorSignup,
  EventorSignupsScraper,
} from 'lib/eventor/scrapers/signups';
import { APIResponse, apiSingletons } from 'lib/singletons';
import crypto from 'crypto';
import { ClassId, OrganizationId, RunnerId } from 'lib/match/generateIds';
import logger from 'lib/logger';

export class SyncEventorSignupsJob {
  private api: APIResponse;
  private scraper: EventorSignupsScraper | null = null;

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

    this.scraper = new EventorSignupsScraper(
      competition.countryCode,
      competition.eventorId,
    );

    const results = await this.scraper.fetchEntries();

    for (const signup of results) {
      await this.insertEventorSignup(signup);
    }

    logger.info(
      `Eventor signups for event ${competition.id} synced successfully.`,
    );
  }

  private async insertEventorSignup(signup: EventorSignup) {
    const signupCompositeId = `${signup.className}-${signup.name}-${signup.club}-${signup.siCard}`;
    const hashedSignupId = crypto
      .createHash('md5')
      .update(signupCompositeId)
      .digest('hex');

    const body: typeof EventorSignupsTable.$inferInsert = {
      signupId: hashedSignupId,
      olClassId: new ClassId().generateId({ className: signup.className }),
      eventorDatabaseId: this.eventorDatabaseId,
      name: signup.name,
      organization: signup.club,
      punchCardNumber: signup.siCard,
      olOrganizationId: new OrganizationId().generateId({
        organizationName: signup.club,
      }),
      olRunnerId: new RunnerId().generateId({
        className: signup.className,
        fullName: signup.name,
        organizationName: signup.club,
      }),
    };

    let [runner] = await this.api.Drizzle.db
      .select()
      .from(EventorSignupsTable)
      .where(eq(EventorSignupsTable.signupId, hashedSignupId))
      .limit(1);

    if (runner) {
      await this.api.Drizzle.db
        .update(EventorSignupsTable)
        .set(body)
        .where(eq(EventorSignupsTable.signupId, hashedSignupId));
    } else {
      [runner] = await this.api.Drizzle.db
        .insert(EventorSignupsTable)
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
