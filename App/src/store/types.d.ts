interface AppState {
    home: HomeReducer;
    general: GeneralReducer;
}

interface GeneralReducer {
    rotation: any;
}

interface HomeReducer {
    searchTerm: string;
    searching: boolean;
}

type GetState = () => AppState;

interface DispatchAction<T> {
    type: string;
    value?: T;
}
