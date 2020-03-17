import { server } from 'lib/server';
import { Cache } from 'lib/redis';

(async () => {
    Cache.init({
        host: process.env.ENV.toLowerCase() === 'live' ? 'redis' : 'localhost',
        port: 6379,
    });

    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
})();
