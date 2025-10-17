import { parse } from 'date-fns';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { EventorCompetitionsTable } from 'lib/db/schema';
import { parseDateWithAI } from 'lib/genai';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class EventorDateParser {
  private api: APIResponse;
  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    const withMissingDates = await this.api.Drizzle.db
      .select({
        id: EventorCompetitionsTable.id,
        dateString: EventorCompetitionsTable.dateString,
      })
      .from(EventorCompetitionsTable)
      .where(
        and(
          isNull(EventorCompetitionsTable.date),
          isNotNull(EventorCompetitionsTable.dateString),
        ),
      )
      // This limit is to avoid being rate limited
      .limit(10);

    if (!withMissingDates.length) {
      console.log('No competitions with missing dates found.');
      return;
    }

    const dateStrings: string[] = withMissingDates
      .map(c => c.dateString as string)
      .filter(Boolean);
    const parsedDates = await this.parseDateToUtc(dateStrings);

    if (!parsedDates) {
      console.log('No dates could be parsed.');
      return;
    }

    let index = 0;
    for (const parsedDate of parsedDates) {
      if (parsedDate) {
        await this.api.Drizzle.db
          .update(EventorCompetitionsTable)
          .set({ date: parsedDate })
          .where(eq(EventorCompetitionsTable.id, withMissingDates[index]!.id));
      }
      index++;
    }
    console.log(`Parsed dates of ${withMissingDates.length} competitions.`);
  }

  private async parseDateToUtc(dateStrings: string[] = []) {
    const aiString = await parseDateWithAI(dateStrings);
    if (!aiString || aiString === 'INVALID') {
      console.warn(`AI could not parse date string: "${dateStrings}"`);
      return null;
    }
    const dates = aiString.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g);

    const utcDates = dates?.map(date =>
      parse(date, "yyyy-MM-dd'T'HH:mm:ssX", new Date()),
    );

    if (!utcDates) {
      console.warn(`Could not parse date string: "${aiString}"`);
      return null;
    }

    return utcDates;
  }
}
