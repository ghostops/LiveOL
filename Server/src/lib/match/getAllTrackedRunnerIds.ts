import { OLTrackingTable } from 'lib/db/schema';
import { globalSeparator, norm } from './generateIds';

export const getAllTrackedRunnerIds = (
  tracking: (typeof OLTrackingTable.$inferSelect)[],
) => {
  return tracking.flatMap(getTrackedRunnerIds);
};

export const getTrackedRunnerIds = (
  tracking: typeof OLTrackingTable.$inferSelect,
) => {
  return tracking.clubs.reduce<string[]>((acc, club) => {
    acc.push(norm(`${tracking.name}${globalSeparator}${club}`));
    return acc;
  }, []);
};
