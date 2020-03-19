import { EventorScraper } from 'lib/eventor/scraper';

(async () => {
    const c = new EventorScraper('https://eventor-sweden-test.orientering.se');

    await c.scrapeDateRange(
        new Date('2020-02-01'),
        new Date('2020-02-02'),
    );
})();
