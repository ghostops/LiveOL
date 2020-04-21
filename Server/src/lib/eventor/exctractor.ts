import { EventorScraper } from 'lib/eventor/scraper';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { EventorEventItem, EventorListItem } from 'lib/eventor/types';
import { getWeek, getDatesFromWeek } from 'lib/helpers/time';
import * as _ from 'lodash';

export class EventorExtractor {
    constructor(
        private scraper: EventorScraper
    ) {}

    public getEventorData = async (liveresultatComp: LiveresultatApi.competition): Promise<EventorEventItem | null> => {
        const eventDate = new Date(liveresultatComp.date);

        // We batch our searches in to the week numbers,
        // this way we keep our number of hits on Eventor down.
        const week = getWeek(eventDate);

        const [startDate, endDate] = getDatesFromWeek(week, eventDate.getFullYear());

        const range = await this.scraper.scrapeDateRange(startDate, endDate);

        console.log(range);

        const eventInList = this.findInRange(liveresultatComp, range, 2);

        if (!eventInList) {
            return null;
        }

        const event = await this.scraper.scrapeEvent(eventInList.id);

        return event;
    }

    private findInRange = (
        comp: LiveresultatApi.competition,
        range: EventorListItem[],
        threshold: number,
    ): EventorListItem | null => {
        const weightList = range.map((item) => this.weighItem(comp, item));

        const winner = _(weightList).sortBy('weight').last();

        if (!winner || winner.weight < threshold) {
            return null;
        }

        return range.find((item) => item.id === winner.id);
    }

    private weighItem = (comp: LiveresultatApi.competition, item: EventorListItem): { id: string, weight: number } => {
        let weight = 0;

        const compDate = new Date(comp.date);

        if (this.datesMatch(item.date, compDate)){
            weight += 1;
        }

        if (item.name === comp.name) {
            weight += 1;
        }

        if (
            !!comp.organizer &&
            item.club.toLowerCase() === comp.organizer.toLowerCase()
        ) {
            weight += 1;
        }

        return {
            weight,
            id: item.id,
        };
    }

    private datesMatch = (a: Date, b: Date): boolean =>
        `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}` ===
        `${b.getFullYear()}-${b.getMonth() + 1}-${b.getDate()}`
}
