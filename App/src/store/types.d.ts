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
    results: OLClass;
    lastPassings: Passing[];
}

interface HomeReducer {
    visibleCompetitions: any[];
    searching: boolean;
}

type GetState = () => AppState;

interface DispatchAction<T> {
    type: string;
    value?: T;
}
