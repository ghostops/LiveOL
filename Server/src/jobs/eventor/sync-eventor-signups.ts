import { eq } from 'drizzle-orm';
import { EventorSignupsTable } from 'lib/db/schema';
import {
  EventorSignup,
  EventorSignupsScraper,
} from 'lib/eventor/scrapers/signups';
import { APIResponse, apiSingletons } from 'lib/singletons';
import crypto from 'crypto';
import { snakeCase } from 'lodash';
import { matchEventorSignUpToRunner } from 'lib/match/eventorToRunner';

export class SyncEventorSignupsJob {
  private api: APIResponse;
  private scraper: EventorSignupsScraper;

  constructor(private eventorId: string) {
    this.api = apiSingletons.createApiSingletons();
    this.scraper = new EventorSignupsScraper(this.eventorId);
  }

  async run() {
    const results = await this.scraper.fetchEntries();

    for (const signup of results) {
      await this.insertEventorSignup(signup);
    }

    console.log(
      `Eventor signups for event ${this.eventorId} synced successfully.`,
    );
  }

  private async insertEventorSignup(signup: EventorSignup) {
    const signupCompositeId = `${signup.className}-${signup.name}-${signup.club}-${signup.siCard}`;
    const hashedSignupId = crypto
      .createHash('md5')
      .update(signupCompositeId)
      .digest('hex');

    const body = {
      signupId: hashedSignupId,
      eventorClassId: `${this.eventorId}-${snakeCase(signup.className)}`,
      eventorId: this.eventorId,
      name: signup.name,
      organization: signup.club,
      punchCardNumber: signup.siCard,
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

    if (runner && runner.olRunnerId === null) {
      await matchEventorSignUpToRunner(runner);
    }
  }
}
