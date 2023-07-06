import { getEnv } from 'lib/helpers/env';
import { server } from 'lib/server';
import * as dotenv from 'dotenv';
import { OLSelfHelper } from 'lib/selfhelp';
import { apiSingletons } from 'lib/singletons';
import { PlusCodeHandler } from 'lib/plusCodes/validator';

(async () => {
	dotenv.config();
	const DEV = getEnv('env') !== 'live';

	const { url } = await server.listen();

	if (!DEV) {
		// On creation this class monitors the GQL queries for errors
		new OLSelfHelper();
	}

	const { Redis } = apiSingletons.createApiSingletons();
	const handler = new PlusCodeHandler(Redis);
	if (DEV) {
		await handler.insertDummyPlusCodes();
	}

	console.info(`🚀  Server ready at "${url}" with env "${getEnv('env') || 'dev'}"`);
	console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);
})();
