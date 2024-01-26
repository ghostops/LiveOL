import { Cacher } from 'lib/redis';
import { EventorClub } from 'lib/eventor/types';
import * as _ from 'lodash';
import * as ms from 'ms';
import * as xmlJs from 'xml-js';
import axios, { AxiosInstance } from 'axios';

export class EventorApi {
	private client: AxiosInstance;

	constructor(
		private base: string,
		private apiKey: string,
		private cache: Cacher,
	) {
		this.client = axios.create({
			headers: {
				'User-Agent': 'LiveOL Server',
				ApiKey: this.apiKey,
			},
		});
	}

	public getClubs = async (): Promise<EventorClub[]> => {
		const cacheKey = 'eventor:clubs';

		let data = await this.cache.get(cacheKey);

		if (!data) {
			data = (await this.client.get(`${this.base}/api/organisations`)).data;
			await this.cache.set(cacheKey, data, { ttlMs: ms('1 day') });
		}

		const parsed = xmlJs.xml2js(data);

		const orgs: any[] = _.get(parsed, 'elements.0.elements');

		return orgs.map(this.mapClub);
	};

	private mapClub = (data): EventorClub => {
		const map: Partial<EventorClub> = {};

		data.elements.forEach((item) => {
			if (item.name === 'OrganisationId') {
				map.id = Number(_.get(item, 'elements.0.text'));
				map.clubLogoUrl = `${this.base}/Organisation/Logotype/${map.id}`;
			}

			if (item.name === 'Name') {
				map.name = _.get(item, 'elements.0.text');
			}

			if (item.name === 'Country') {
				map.country = _.get(item, 'elements.1.attributes.value');
			}

			if (item.name === 'Address') {
				map.address = [
					`${_.get(item, 'attributes.street')},`,
					_.get(item, 'attributes.zipCode'),
					_.get(item, 'attributes.city'),
					_.get(item, 'attributes.careOf'),
				].join(' ');
			}

			if (item.name === 'Tele') {
				map.website = _.get(item, 'attributes.webURL');
				map.email = _.get(item, 'attributes.mailAddress');
			}
		});

		return map as EventorClub;
	};
}
