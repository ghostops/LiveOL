import { EventorScraper } from './src/lib/eventor/scraper';
import { Cacher } from './src/lib/redis';
import Axios from 'axios';
import * as xmlJs from 'xml-js';

(async () => {
    // const c = new EventorScraper('https://eventor.orientering.se', new Cacher);

    // const listres = await c.scrapeDateRange(
    //     new Date('2020-02-01'),
    //     new Date('2020-02-01'),
    // );

    // const eventres = await c.scrapeEvent(1);

    // console.log(eventres);

    const res = await Axios.get('https://eventor.orientering.se/api/organisations', {
        headers: {
           ApiKey: '', 
        },
    });

    const parsed = xmlJs.xml2js(res.data);

    console.log(JSON.stringify(parsed, null, 4));
})();
