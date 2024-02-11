import { diffDateNow } from '~/util/date';
import { TRPCQueryOutput } from '~/lib/trpc/client';

export const startIsAfterNow = (
  result: TRPCQueryOutput['getResults']['results'][0],
): boolean => !!diffDateNow(result.start);

export const isLiveRunning = (
  result: TRPCQueryOutput['getResults']['results'][0],
): boolean => {
  return result.progress < 100 && startIsAfterNow(result) && result.start !== 0;
};
