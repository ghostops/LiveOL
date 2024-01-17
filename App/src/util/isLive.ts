import { diffDateNow } from '~/util/date';
import { OlResult } from '~/lib/graphql/generated/types';

export const startIsAfterNow = (result: OlResult): boolean =>
  !!diffDateNow(result.liveRunningStart);

export const isLiveRunning = (result: OlResult): boolean => {
  return (
    result.progress < 100 &&
    startIsAfterNow(result) &&
    result.start !== '00:00:00'
  );
};
