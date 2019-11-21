import { NavigationScreenProp } from 'react-navigation';
import _ from 'lodash';

export const getNavigationParam = (name: string, navigation: NavigationScreenProp<any, any>) => {
    return _.get(navigation, `state.params.${name}`, null);
};
