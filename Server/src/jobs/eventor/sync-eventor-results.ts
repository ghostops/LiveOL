import {
  EventorResult,
  EventorResultsScraper,
} from 'lib/eventor/scrapers/results';
import { APIResponse, apiSingletons } from 'lib/singletons';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import {
  EventorCompetitionsTable,
  EventorResultsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import { snakeCase } from 'lodash';
import { OrganizationId, RunnerId } from 'lib/match/generateIds';

export class SyncEventorResultsJob {
  private scraper: EventorResultsScraper | null = null;
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

    this.scraper = new EventorResultsScraper(
      competition.eventorId,
      competition.countryCode,
    );

    const results = await this.scraper.fetchResults();

    for (const result of results) {
      await this.insertEventorResult(result);
    }

    console.log(
      `Eventor results for event ${this.eventorDatabaseId} synced successfully.`,
    );
  }

  private async insertEventorResult(result: EventorResult) {
    const resultCompositeId = `${result.className}-${result.name}-${result.club}-${result.time}`;
    const hashedSignupId = crypto
      .createHash('md5')
      .update(resultCompositeId)
      .digest('hex');

    const body: typeof EventorResultsTable.$inferInsert = {
      resultId: hashedSignupId,
      eventorClassId: `${this.eventorDatabaseId}-${snakeCase(result.className)}`,
      eventorDatabaseId: this.eventorDatabaseId,
      place: result.position,
      name: result.name,
      organization: result.club,
      time: this.eventorTimeToSeconds(result.time),
      timePlus: this.eventorTimeToSeconds(result.timePlus),
      status: this.eventorStatusToNumber(result.time)?.toString(),
      distanceInMeters: this.eventorDistanceToMeters(result.distance),

      olOrganizationId: new OrganizationId().generateId({
        organizationName: result.club,
      }),
      olRunnerId: new RunnerId().generateId({
        className: result.className,
        fullName: result.name,
        organizationName: result.club,
      }),
    };

    let [runner] = await this.api.Drizzle.db
      .select()
      .from(EventorResultsTable)
      .where(eq(EventorResultsTable.resultId, hashedSignupId))
      .limit(1);

    if (runner) {
      await this.api.Drizzle.db
        .update(EventorResultsTable)
        .set(body)
        .where(eq(EventorResultsTable.resultId, hashedSignupId));
    } else {
      [runner] = await this.api.Drizzle.db
        .insert(EventorResultsTable)
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

  private eventorTimeToSeconds(eventorTime: string): number | undefined {
    if (!eventorTime) return undefined;

    const [hourStr, minutesStr, secondsStr] = eventorTime
      .replace('+', '')
      .split(':');

    const hours = Number(hourStr) || 0;
    const minutes = Number(minutesStr) || 0;
    const seconds = Number(secondsStr) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  // The statuses are based on liveresultats number-mapping
  private eventorStatusToNumber(eventorStatus: string): number | undefined {
    let status = 0;

    if (!eventorStatus.includes(':')) {
      switch (eventorStatus.toLowerCase()) {
        case 'ej start':
          status = 1;
          break;
        case 'ej godkänd':
          status = 3;
          break;
        case 'godkänd':
        default:
          status = 0;
          break;
      }
    }
    return status;
  }

  private eventorDistanceToMeters(eventorDistance: string): number | undefined {
    if (!eventorDistance) return undefined;
    const meters = eventorDistance.replace(/\s+/g, '').slice(0, -1);
    const asNumber = Number(meters);
    if (isNaN(asNumber)) return undefined;
    return asNumber;
  }
}
