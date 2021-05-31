interface AppState {
	home: HomeReducer;
	general: GeneralReducer;
}

interface GeneralReducer {
	rotation: 'landscape' | 'portrait';
	audioMuted: boolean;
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
