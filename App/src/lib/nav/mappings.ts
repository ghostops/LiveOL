import { OLCompetition } from '../../views/scenes/competition/container';
import { OLHome } from '../../views/scenes/home/container';
import { OLInfo } from '../../views/scenes/info/container';
import { OLPassings } from '../../views/scenes/last_passings/container';
import { Routes } from './routes';
import { OLResults } from 'views/scenes/results/container';
import { OLClubResults } from 'views/scenes/club/container';

export const Mappings = {
	[Routes.home]: OLHome,
	[Routes.competition]: OLCompetition,
	[Routes.passings]: OLPassings,
	[Routes.info]: OLInfo,
	[Routes.results]: OLResults,
	[Routes.club]: OLClubResults,
};
