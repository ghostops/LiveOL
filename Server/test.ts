import { EventorScraper } from './src/lib/eventor/scraper';
import { Cacher } from './src/lib/redis';

(async () => {
    const c = new EventorScraper('https://eventor.orientering.se', new Cacher);

    const listres = await c.scrapeDateRange(
        new Date('2020-02-01'),
        new Date('2020-02-01'),
    );

    const eventres = await c.scrapeEvent(1);

    console.log(eventres);
})();
