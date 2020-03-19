import * as cheerio from 'cheerio';
import axios, { AxiosInstance } from 'axios';


export class EventorScraper {
    private client: AxiosInstance;

    constructor(
        private baseUrl: string,
    ) {
        this.client = axios.create({
            // headers: {
            //     'User-Agent': 'LiveOL Server',
            // },
        });
    }

    public scrapeDateRange = async (startDate: Date, endDate: Date) => {
        const start = this.dateToString(startDate);
        const end = this.dateToString(endDate);

        const { data } = await this.client.get(`${this.baseUrl}/Events?startDate=${start}&endDate=${end}`);

        console.log(data);
    }

    private dateToString = (date: Date): string => {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
}
