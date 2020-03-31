import { EventorScraper } from './src/lib/eventor/scraper';

(async () => {
    const c = new EventorScraper('https://eventor.orientering.se');

    const listres = await c.scrapeDateRange(
        new Date('2020-02-01'),
        new Date('2020-02-01'),
    );

    const eventres = await c.scrapeEvent(1);

    console.log(eventres);
})();
