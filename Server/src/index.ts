import { getEnv } from 'lib/helpers/env';
import { server } from 'lib/server';
import * as dotenv from 'dotenv';

(async () => {
    dotenv.config();

    const { url } = await server.listen();

    console.info(`🚀  Server ready at "${url}" with env "${getEnv('env') || 'dev'}"`);
    console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);
})();
