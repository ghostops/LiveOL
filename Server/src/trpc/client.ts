import { initTRPC } from '@trpc/server';
import { apiSingletons } from 'lib/singletons';

type Context = ReturnType<typeof apiSingletons.createApiSingletons>;

const t = initTRPC.context<Context>().create()

export const router = t.router;
export const publicProcedure = t.procedure;