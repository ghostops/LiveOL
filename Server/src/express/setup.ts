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
import {
  getTrackedRunners,
  removeTrackedRunner,
  trackNewRunner,
  getTrackedRunner,
  updateTrackedRunner,
} from 'controllers/track';
import { createConfig, DependsOnMethod, Routing } from 'express-zod-api';

export const config = createConfig({
  http: { listen: 3000 },
  cors: false,
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

  'v1/track/add': trackNewRunner,
  'v1/track': getTrackedRunners,
  'v1/track/:id': new DependsOnMethod({
    delete: removeTrackedRunner,
    get: getTrackedRunner,
    put: updateTrackedRunner,
  }),
};
