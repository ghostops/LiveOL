import * as React from 'react';
import { createStackNavigator } from 'react-navigation';
import { OLList } from 'views/scenes/list';
import { OLComp } from 'views/scenes/comp';
import { OLClass } from 'views/scenes/class';
import { OLClub } from 'views/scenes/club';
import { OLPassings } from 'views/scenes/passings';

const OLNavigator = createStackNavigator(
    {
        home: {
            screen: OLList,
        },
        comp: {
            screen: OLComp,
        },
        class: {
            screen: OLClass,
        },
        club: {
            screen: OLClub,
        },
        passings: {
            screen: OLPassings,
        },
    }, 
    {
        initalRouteName: 'home',
    },
);

console['ignoredYellowBox'] = [
    'Warning: isMounted',
];

export default class App extends React.PureComponent {
    render() {
        return (
            <OLNavigator />
        );
    }
}
