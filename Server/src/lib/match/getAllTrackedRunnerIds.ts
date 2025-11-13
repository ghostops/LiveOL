import { OLTrackingTable } from 'lib/db/schema';
import { RunnerId } from './generateIds';

export const getAllTrackedRunnerIds = (
  tracking: (typeof OLTrackingTable.$inferSelect)[],
) => {
  return tracking.flatMap(getTrackedRunnerIds);
};

export const getTrackedRunnerIds = (
  tracking: typeof OLTrackingTable.$inferSelect,
) => {
  return tracking.clubs.reduce<string[]>((acc, club) => {
    tracking.classes.forEach(className => {
      const id = new RunnerId().generateId({
        className,
        fullName: tracking.name,
        organizationName: club,
      });
      acc.push(id);
    });
    return acc;
  }, []);
};
