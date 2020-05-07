import { EventorScraper } from 'lib/eventor/scraper';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { EventorEventItem, EventorListItem } from 'lib/eventor/types';
import { getMomentsFromWeek } from 'lib/helpers/time';
import * as _ from 'lodash';
import * as moment from 'moment';

export class EventorExtractor {
    constructor(
        private scraper: EventorScraper
    ) {}

    public getEventorData = async (liveresultatComp: LiveresultatApi.competition): Promise<EventorEventItem | null> => {
        const eventDate = moment.utc(liveresultatComp.date);

        // We batch our searches in to the week numbers,
        // this way we keep our number of hits on Eventor down.
        const week = eventDate.week();

        const [startDate, endDate] = getMomentsFromWeek(week, eventDate.get('year'));

        const range = await this.scraper.scrapeDateRange(startDate, endDate);

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

        const compDate = moment.utc(comp.date);

        if (compDate.isSame(moment.utc(item.date), 'date')){
            weight += 1;
        }

        weight += 1;

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
}
