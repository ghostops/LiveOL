import { getEnv } from 'lib/helpers/env';
import { server } from 'lib/server';
import * as dotenv from 'dotenv';
import { OLSelfHelper } from 'lib/selfhelp';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter, createContext } from 'trpc';


(async () => {
	dotenv.config();
	const DEV = getEnv('env') !== 'live';

	const { url } = await server.listen();

	if (!DEV) {
		// On creation this class monitors the GQL queries for errors
		new OLSelfHelper();
	}

	const trpcServer = createHTTPServer({
		router: appRouter,
		createContext,
	});
	 
	const port = 3000;
	trpcServer.listen(port);
	console.info(`🚀  TRPC Server ready on port "${port}" with env "${getEnv('env') || 'dev'}"`);

	console.info(`🚀  Server ready at "${url}" with env "${getEnv('env') || 'dev'}"`);
	console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);
})();
