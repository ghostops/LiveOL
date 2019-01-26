import { createStackNavigator, createAppContainer, NavigationContainer } from 'react-navigation';
import { Routes } from './routes';
import { Mappings } from './mappings';
import { COLORS } from 'util/const';
import Lang from 'lib/lang';

export default (): NavigationContainer => {
    const AppNavigator = createStackNavigator(Mappings, {
        initialRouteName: Routes.home,
        defaultNavigationOptions: {
            headerTitleStyle: {
                color: 'white',
            },
            headerStyle: {
                backgroundColor: COLORS.MAIN,
            },
            headerTintColor: 'white',
            headerBackTitle: Lang.print('back'),
        },
    });

    return createAppContainer(AppNavigator);
};
