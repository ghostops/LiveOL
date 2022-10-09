import { Result } from 'lib/graphql/fragments/types/Result';

export const resultsChanged = (prev: Result, now: Result) =>
	prev.place !== now.place ||
	prev.result !== now.result ||
	prev.status !== now.status ||
	prev.splits.map((s) => s.time).join() !== now.splits.map((s) => s.time).join();
