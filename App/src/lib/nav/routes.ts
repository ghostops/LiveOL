import { NavigationProp } from '@react-navigation/native';

export const Routes = {
	home: 'home',
	competition: 'competition',
	passings: 'competition.passings',
	info: 'info',
	results: 'results',
	club: 'club',
};

interface RouteProps<T> {
	key: string;
	name: string;
	params: T;
}

export type RouterProps<T> = {
	navigation: NavigationProp<any, any>;
	route: RouteProps<T>;
};
