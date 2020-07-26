import { getEnv } from 'lib/helpers/env';
import { server } from 'lib/server';
import * as dotenv from 'dotenv';
import { OLSelfHelper } from 'lib/selfhelp';

(async () => {
    dotenv.config();

    const { url } = await server.listen();

    // On creation this class monitors the GQL queries for errors
    new OLSelfHelper();

    console.info(`🚀  Server ready at "${url}" with env "${getEnv('env') || 'dev'}"`);
    console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);
})();
