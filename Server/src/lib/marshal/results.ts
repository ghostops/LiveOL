import { differenceInSeconds } from 'date-fns';
import {
  LiveResultsTable,
  LiveSplitResultsTable,
  OLTrackingTable,
  OLUsersTable,
} from 'lib/db/schema';
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
  }: {
    user?: typeof OLUsersTable.$inferSelect;
    tracking?: (typeof OLTrackingTable.$inferSelect)[];
    className?: string | null;
  }) =>
  (result: ResultWithMaybeSplits) => {
    let isTracking = false;
    if (user?.hasPlus && tracking?.length) {
      const trackedIds = getAllTrackedRunnerIds(tracking);
      isTracking = trackedIds.includes(result.olRunnerId);
    }
    return {
      ...result,
      isLive: !!(
        result.start !== null &&
        result.progress !== null &&
        result.progress < 100 &&
        result.status &&
        result.status < 1
      ),
      hasRecentlyUpdated: checkIfRecentlyUpdated(result),
      isTracking,
      className:
        'className' in result
          ? (result.className as string)
          : className || undefined,
    };
  };

const RECENTLY_UPDATED_THRESHOLD_SECONDS = 120;

function checkIfRecentlyUpdated(result: ResultWithMaybeSplits) {
  if (
    result.updatedAt &&
    differenceInSeconds(new Date(), result.updatedAt) <=
      RECENTLY_UPDATED_THRESHOLD_SECONDS
  ) {
    return true;
  }
  if (result.splitResults) {
    for (const splitResult of result.splitResults) {
      if (
        splitResult.updatedAt &&
        differenceInSeconds(new Date(), splitResult.updatedAt) <=
          RECENTLY_UPDATED_THRESHOLD_SECONDS
      ) {
        return true;
      }
    }
  }
  return false;
}
