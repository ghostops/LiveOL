import { parse } from 'date-fns';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { EventorCompetitionsTable } from 'lib/db/schema';
import { parseDateWithAI } from 'lib/genai';
import { APIResponse, apiSingletons } from 'lib/singletons';

// ToDo:
// - Rate limit this to match the free tier rate limits
// - Schedule this job to run every so often
export class EventorDateParser {
  private api: APIResponse;
  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    const withMissingDates = await this.api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(
        and(
          isNull(EventorCompetitionsTable.date),
          isNotNull(EventorCompetitionsTable.dateString),
        ),
      );

    if (!withMissingDates.length) {
      console.log('No competitions with missing dates found.');
      return;
    }

    let parsed = 0;
    for (const competition of withMissingDates) {
      if (!competition.dateString) {
        continue;
      }
      const parsedDate = await this.parseDateToUtc(competition.dateString);
      if (parsedDate) {
        await this.api.Drizzle.db
          .update(EventorCompetitionsTable)
          .set({ date: parsedDate })
          .where(eq(EventorCompetitionsTable.id, competition.id));
        parsed++;
      }
    }
    console.log(
      `Parsed ${parsed} dates out of ${withMissingDates.length} competitions.`,
    );
  }

  private async parseDateToUtc(dateString: string = '') {
    if (!dateString) return null;

    const aiString = await parseDateWithAI(dateString);
    if (!aiString || aiString === 'INVALID') {
      console.warn(`AI could not parse date string: "${dateString}"`);
      return null;
    }
    const utcDate = parse(aiString, "yyyy-MM-dd'T'HH:mm:ssX", new Date());

    if (!utcDate) {
      console.warn(`Could not parse date string: "${aiString}"`);
      return null;
    }

    return utcDate;
  }
}
