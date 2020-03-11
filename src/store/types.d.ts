interface AppState {
    api: ApiReducer;
    home: HomeReducer;
    general: GeneralReducer;
}

interface GeneralReducer {
    rotation: any;
}

interface ApiReducer {
    competitions: Comp[];
    classes: Classes[];
    results: Class;
    lastPassings: Passing[];
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
