import { createStackNavigator, createAppContainer } from 'react-navigation';
import { Routes } from './routes';
import { Mappings } from './mappings';

const AppNavigator = createStackNavigator(Mappings, {
    initialRouteName: Routes.home,
});

export default createAppContainer(AppNavigator);
