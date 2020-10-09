interface AppState {
	home: HomeReducer;
	general: GeneralReducer;
}

interface GeneralReducer {
	rotation: 'landscape' | 'portrait';
	expoPushToken: string;
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
