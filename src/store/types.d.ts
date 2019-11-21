interface AppState {
    api: ApiReducer;
    home: HomeReducer;
}

interface ApiReducer {
    competitions: Comp[];
}

interface HomeReducer {
    visibleCompetitions: Comp[];
    searching: boolean;
}

type GetState = () => AppState;

interface DispatchAction<T> {
    type: string;
    value?: T;
}
