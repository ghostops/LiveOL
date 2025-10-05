import { EventorScraper } from 'lib/eventor/scraper';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { EventorEventItem, EventorListItem } from 'lib/eventor/types';
import { getMonthFromDate } from 'lib/helpers/time';
import _ from 'lodash';
import { isSameDay, parse } from 'date-fns';

export class EventorExtractor {
  constructor(private scraper: EventorScraper) {}

  public getEventorData = async (
    liveresultatComp: LiveresultatApi.competition,
  ): Promise<EventorEventItem | null> => {
    const eventDate = parse(liveresultatComp.date, 'yyyy-MM-dd', new Date());

    // We batch our start and end date search to not scrape Eventor to hard
    const [startDate, endDate] = getMonthFromDate(eventDate);

    const range = await this.scraper.scrapeDateRange(startDate, endDate);

    const eventInList = this.findInRange(liveresultatComp, range, 2);

    if (!eventInList) {
      return null;
    }

    const event = await this.scraper.scrapeEvent(eventInList.id);

    return event;
  };

  private findInRange = (
    comp: LiveresultatApi.competition,
    range: EventorListItem[],
    threshold: number,
  ): EventorListItem | undefined => {
    const weightList = range.map(item =>
      EventorExtractor.weighItem(comp, item),
    );

    const sorted = _(weightList).sortBy('weight');

    const winner = sorted.last();

    if (!winner || winner.weight < threshold) {
      return undefined;
    }

    return range.find(item => item.id === winner.id);
  };

  public static weighItem = (
    comp: Pick<LiveresultatApi.competition, 'date' | 'name' | 'organizer'>,
    item: Pick<EventorListItem, 'id' | 'name' | 'club' | 'date'>,
  ): { id: string; weight: number; weightBy: string[] } => {
    let weight = 0;
    const weightBy = [];

    const trim = (str: string | undefined) =>
      str ? str.trim().toLowerCase() : '';

    // These dates need to match up correctly based on TZ...
    // Currently it is not working!!
    const compDate = parse(comp.date, 'yyyy-MM-dd', new Date());
    const itemDate = item.date
      ? parse(item.date, 'yyyy-MM-dd', new Date())
      : null;

    if (itemDate && isSameDay(compDate, itemDate)) {
      weight += 1;
      weightBy.push('date');
    }

    if (trim(item?.name) === trim(comp?.name)) {
      weight += 1;
      weightBy.push('name');
    }

    if (!!comp.organizer && trim(item?.club) === trim(comp.organizer)) {
      weight += 1;
      weightBy.push('club');
    }

    return {
      weight,
      weightBy,
      id: item.id,
    };
  };
}
