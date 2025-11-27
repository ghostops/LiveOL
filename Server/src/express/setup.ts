import { createConfig, Routing } from 'express-zod-api';
import {
  getCompetitions as getCompetitionsV2,
  getCompetition as getCompetitionV2,
  getTodaysCompetitions,
  searchCompetitions,
} from 'controllers/competitions';
import { getEnv } from 'lib/helpers/env';
import {
  getLiveResultsForOrganisation,
  getLiveResultsForTrackedRunner,
  getResultByLiveClassId,
} from 'controllers/results';
import { registerUser } from 'controllers/users';
import {
  listTracking,
  createTracking,
  updateTracking,
  deleteTracking,
  getUserSelfTracking,
} from 'controllers/tracking';
import { getApiStatus, getServerStatus } from 'controllers/status';
import { getAllOrganizations } from 'controllers/organizations';
import { getAllClasses } from 'controllers/classes';

export const config = createConfig({
  http: { listen: 3000 },
  cors: getEnv('NODE_ENV', true) === 'development',
  startupLogo: false,
});

export const routing: Routing = {
  health: getServerStatus,
  'v2/status': getApiStatus,

  'v2/competitions': getCompetitionsV2,
  'v2/competitions/search': searchCompetitions,
  'v2/competitions/today': getTodaysCompetitions,
  'v2/competitions/:id': getCompetitionV2,

  'v2/results/live/:liveClassId': getResultByLiveClassId,
  'v2/results/live/organizations/:olCompetitionId/:olOrganizationId':
    getLiveResultsForOrganisation,
  'v2/results/live/tracked/:trackingId': getLiveResultsForTrackedRunner,

  'v2/users/register': registerUser,

  'v2/tracking': listTracking,
  'v2/tracking/create': createTracking,
  'v2/tracking/:id': updateTracking,
  'v2/tracking/:id/delete': deleteTracking,
  'v2/tracking/self': getUserSelfTracking,

  'v2/strings/organizations': getAllOrganizations,
  'v2/strings/classes': getAllClasses,
};
