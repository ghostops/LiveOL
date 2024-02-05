import { TRPCQueryOutput } from '~/lib/trpc/client';

export const resultsChanged = (
  prev: TRPCQueryOutput['getResults'][0],
  now: TRPCQueryOutput['getResults'][0],
) =>
  prev.place !== now.place ||
  prev.result !== now.result ||
  prev.status !== now.status ||
  prev.splits.map(s => s.time).join() !== now.splits.map(s => s.time).join();
