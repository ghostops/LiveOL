import { OLCompetition } from '../../views/scenes/competition/container';
import { OLHome } from '../../views/scenes/home/container';
import { OLInfo } from '../../views/scenes/info';
import { OLPassings } from '../../views/scenes/last_passings/container';
import { Routes } from './routes';
import { OLResults } from 'views/scenes/results/container';

export const Mappings = {
	[Routes.home]: OLHome,
	[Routes.competition]: OLCompetition,
	[Routes.passings]: OLPassings,
	[Routes.info]: OLInfo,
	[Routes.results]: OLResults,
};
