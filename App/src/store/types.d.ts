interface AppState {
    home: HomeReducer;
    general: GeneralReducer;
}

interface GeneralReducer {
    rotation: any;
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
