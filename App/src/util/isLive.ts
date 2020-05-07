import { diffDateNow } from 'util/date';
import { Result } from 'lib/graphql/fragments/types/Result';

export const startIsAfterNow = (result: Result): boolean => !!diffDateNow(result.liveRunningStart);

export const isLiveRunning = (result: Result): boolean => {
    return (
        result.progress < 100 &&
        startIsAfterNow(result) &&
        result.start !== '00:00:00'
    );
};
