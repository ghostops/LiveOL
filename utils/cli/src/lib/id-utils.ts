// Re-export Server utilities
export {
  RunnerId,
  OrganizationId,
  CompetitionId,
  norm,
} from '../../../../server/src/lib/match/generateIds';

import crypto from 'crypto';

export const generateLiveClassId = (
  competitionId: number,
  className: string,
): string => {
  return crypto
    .createHash('md5')
    .update(`${competitionId}${encodeURIComponent(className)}`)
    .digest('hex');
};

export const generateLiveResultId = (
  liveClassId: string,
  name: string,
  org: string,
  place: string,
): string => {
  const composite = [
    liveClassId,
    name.replace(/ /g, '_'),
    org.replace(/ /g, '_'),
    place.replace(/ /g, '_'),
  ].join(':');
  return crypto.createHash('md5').update(composite).digest('hex');
};
