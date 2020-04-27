import { Cache } from 'lib/redis';
import { getEnv } from 'lib/helpers/env';
import { server } from 'lib/server';
import * as dotenv from 'dotenv';

(async () => {
    dotenv.config();

    Cache.init({
        host: (
            getEnv('env') === 'live'
            ? 'redis'
            : 'localhost'
        ),
        port: 6379,
    });

    const { url } = await server.listen();

    console.info(`🚀  Server ready at "${url}" with env "${getEnv('env') || 'dev'}"`);
})();
