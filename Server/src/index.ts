import { server } from 'lib/server';
import { Cache } from 'lib/redis';
import * as dotenv from 'dotenv';

(async () => {
    dotenv.config();

    Cache.init({
        host: (
            process.env.ENV &&
            process.env.ENV.toLowerCase() === 'live'
            ? 'redis'
            : 'localhost'
        ),
        port: 6379,
    });

    const { url } = await server.listen();

    console.info(`🚀  Server ready at ${url}`);
})();
