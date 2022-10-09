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
  navigation: any;
  route: RouteProps<T>;
};
