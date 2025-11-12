import {
  getCompetitions,
  getCompetitionsToday,
  getCompetition,
  getCompetitionLastPassings,
} from 'controllers/competitions';
import { redeemPlusCode, validatePlusCode } from 'controllers/plus';
import {
  getResultsForClass,
  getResultsForClub,
  getSplitControls,
} from 'controllers/results';
import { createConfig, Routing } from 'express-zod-api';
import {
  getCompetitions as getCompetitionsV2,
  getCompetition as getCompetitionV2,
} from 'controllers/v2/competitions';
import { getEnv } from 'lib/helpers/env';
import {
  getOrganization,
  getOrganizationCompetitions,
} from 'controllers/v2/organizations';
import { getEventorResultsForCompetition } from 'controllers/v2/runners';
import {
  getLiveResultsForOrganisation,
  getLiveResultsForTrackedRunner,
  getResultByLiveClassId,
} from 'controllers/v2/results';
import { registerUser } from 'controllers/v2/users';
import {
  listTracking,
  createTracking,
  updateTracking,
  deleteTracking,
} from 'controllers/v2/tracking';

export const config = createConfig({
  http: { listen: 3000 },
  cors: getEnv('NODE_ENV', true) === 'development',
  startupLogo: false,
});

export const routing: Routing = {
  'v1/competitions': getCompetitions,
  'v1/competitions/today': getCompetitionsToday,
  'v1/competitions/:competitionId': getCompetition,
  'v1/competitions/:competitionId/last-passings': getCompetitionLastPassings,

  'v1/results/:competitionId/class/:className': getResultsForClass,
  'v1/results/:competitionId/club/:clubName': getResultsForClub,
  'v1/results/:competitionId/class/:className/splits': getSplitControls,

  'v1/plus/validate': validatePlusCode,
  'v1/plus/redeem': redeemPlusCode,

  'v2/competitions': getCompetitionsV2,
  'v2/competitions/:id': getCompetitionV2,
  'v2/competitions/:id/results/eventor': getEventorResultsForCompetition,

  'v2/organizations/:id': getOrganization,
  'v2/organizations/:id/competitions': getOrganizationCompetitions,

  'v2/results/live/:liveClassId': getResultByLiveClassId,
  'v2/results/live/organizations/:olCompetitionId/:olOrganizationId':
    getLiveResultsForOrganisation,
  'v2/results/live/tracked/:trackingId': getLiveResultsForTrackedRunner,

  'v2/users/register': registerUser,

  'v2/tracking': listTracking,
  'v2/tracking/create': createTracking,
  'v2/tracking/:id': updateTracking,
  'v2/tracking/:id/delete': deleteTracking,
};
