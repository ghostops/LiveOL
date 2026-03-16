import { differenceInSeconds } from 'date-fns';
import {
  LiveResultsTable,
  LiveSplitResultsTable,
  OLTrackingTable,
  OLUsersTable,
} from 'lib/db/schema';
import { globalSeparator } from 'lib/match/generateIds';
import { getAllTrackedRunnerIds } from 'lib/match/getAllTrackedRunnerIds';

export type ResultWithMaybeSplits = typeof LiveResultsTable.$inferSelect & {
  splitResults?: (Omit<typeof LiveSplitResultsTable.$inferInsert, 'code'> & {
    code: string;
  })[];
};

export type MarshaledResult = ResultWithMaybeSplits & {
  isLive: boolean;
  isTracking: boolean;
  hasRecentlyUpdated: boolean;
  className: string | undefined;
};

export const marshalResult =
  ({
    user,
    tracking,
    className,
    nowTimestamp,
  }: {
    user?: typeof OLUsersTable.$inferSelect;
    tracking?: (typeof OLTrackingTable.$inferSelect)[];
    className?: string | null;
    nowTimestamp: number;
  }) =>
  (result: ResultWithMaybeSplits) => {
    const isTracking = Boolean(
      user?.hasPlus &&
        tracking?.length &&
        getAllTrackedRunnerIds(tracking).some(id => {
          const [name, club] = id.split(globalSeparator);
          return (
            name &&
            club &&
            result.olRunnerId.startsWith(name) &&
            result.olRunnerId.endsWith(club)
          );
        }),
    );

    // If the result has not been updated for more than 3 days the runner MUST be done
    const isOutdated =
      result.updatedAt &&
      differenceInSeconds(new Date(), result.updatedAt) > 3 * 24 * 60 * 60;

    return {
      ...result,
      isLive: !!(
        !result.result &&
        result.start !== null &&
        result.progress !== null &&
        result.progress < 100 &&
        result.start <= nowTimestamp &&
        result.updatedAt &&
        !isOutdated
      ),
      hasRecentlyUpdated: checkIfRecentlyUpdated(result),
      isTracking,
      className:
        'className' in result
          ? (result.className as string)
          : className || undefined,
    };
  };

export const RECENTLY_UPDATED_THRESHOLD_SECONDS = 120;

function checkIfRecentlyUpdated(result: ResultWithMaybeSplits) {
  if (
    result.newResultAt &&
    differenceInSeconds(new Date(), result.newResultAt) <=
      RECENTLY_UPDATED_THRESHOLD_SECONDS
  ) {
    return true;
  }

  return false;
}
