import { EventorScraper } from 'lib/eventor/scraper';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { EventorEventItem, EventorListItem } from 'lib/eventor/types';
import { getMonthFromDate } from 'lib/helpers/time';
import * as _ from 'lodash';
import * as moment from 'moment';

export class EventorExtractor {
	constructor(private scraper: EventorScraper) {}

	public getEventorData = async (liveresultatComp: LiveresultatApi.competition): Promise<EventorEventItem | null> => {
		const eventDate = moment.utc(liveresultatComp.date);

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
	): EventorListItem | null => {
		const weightList = range.map((item) => this.weighItem(comp, item));

		const sorted = _(weightList).sortBy('weight');

		const winner = sorted.last();

		if (!winner || winner.weight < threshold) {
			return null;
		}

		return range.find((item) => item.id === winner.id);
	};

	private weighItem = (
		comp: LiveresultatApi.competition,
		item: EventorListItem,
	): { id: string; weight: number; weightBy: string[] } => {
		let weight = 0;
		const weightBy = [];

		const compDate = moment.utc(comp.date);

		if (compDate.isSame(moment.utc(item.date), 'date')) {
			weight += 1;
			weightBy.push('date');
		}

		if (item.name.toLowerCase() === comp.name.toLowerCase()) {
			weight += 1;
			weightBy.push('name');
		}

		if (!!comp.organizer && item.club.toLowerCase() === comp.organizer.toLowerCase()) {
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
