import { OLHome } from '../../views/scenes/home';
import { NavigationRouteConfigMap } from 'react-navigation';
import { OLCompetition } from '../../views/scenes/competition';
import { OLClasses } from '../../views/scenes/classes';
import { OLClub } from '../../views/scenes/club';
import { OLPassings } from '../../views/scenes/competition/passings';
import { Routes } from './routes';
import { OLInfo } from '../../views/scenes/info';

export const Mappings: NavigationRouteConfigMap = {
    [Routes.home]: {
        screen: OLHome,
    },
    [Routes.competition]: {
        screen: OLCompetition,
    },
    [Routes.classes]: {
        screen: OLClasses,
    },
    [Routes.club]: {
        screen: OLClub,
    },
    [Routes.passings]: {
        screen: OLPassings,
    },
    [Routes.info]: {
        screen: OLInfo,
    },
};
