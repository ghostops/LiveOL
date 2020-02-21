import { OLClasses } from '../../views/scenes/classes';
import { OLClub } from '../../views/scenes/club';
import { OLCompetition } from '../../views/scenes/competition/container';
import { OLHome } from '../../views/scenes/home/container';
import { OLInfo } from '../../views/scenes/info';
import { OLPassings } from '../../views/scenes/latest_passings/container';
import { Routes } from './routes';

export const Mappings = {
    [Routes.home]: OLHome,
    [Routes.competition]: OLCompetition,
    [Routes.classes]: OLClasses,
    [Routes.club]: OLClub,
    [Routes.passings]: OLPassings,
    [Routes.info]: OLInfo,
};
