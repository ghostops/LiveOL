import axios, { AxiosInstance } from 'axios';
import { ListResponseParser, EventResponseParser } from './parser';
import * as fs from 'fs';

const DEV = true;

export class EventorScraper {
    private client: AxiosInstance;

    constructor(
        private baseUrl: string,
    ) {
        this.client = axios.create({
            headers: {
                'User-Agent': 'LiveOL Server',
            },
        });
    }

    public scrapeDateRange = async (startDate: Date, endDate: Date) => {
        const start = this.dateToString(startDate);
        const end = this.dateToString(endDate);
        
        const url = `${this.baseUrl}/Events?startDate=${start}&endDate=${end}`;

        let data: string;

        if (DEV) {
            console.info('Read from DEV cache');
            data = fs.readFileSync(`${__dirname}/test/list-body.html`).toString();
        } else {
            data = (await this.client.get(url)).data;
        }

        const parser = new ListResponseParser(data, this.baseUrl);
        const parsed = parser.parse();
        
        return parsed;
    }

    public scrapeEvent = async (id: string | number) => {        
        const url = `${this.baseUrl}/Events/Show/${id}`;
        
        let data: string;

        if (DEV) {
            console.info('Read from DEV cache');
            data = fs.readFileSync(`${__dirname}/test/event-body.html`).toString();
        } else {
            data = (await this.client.get(url)).data;
        }

        const parser = new EventResponseParser(data, this.baseUrl);
        const parsed = parser.parse();

        return parsed;
    }

    private dateToString = (date: Date): string => {
        const pad = (num: number): string => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
}
