import { OlResult } from '~/lib/graphql/generated/types';

export const resultsChanged = (prev: OlResult, now: OlResult) =>
  prev.place !== now.place ||
  prev.result !== now.result ||
  prev.status !== now.status ||
  prev.splits.map(s => s.time).join() !== now.splits.map(s => s.time).join();
