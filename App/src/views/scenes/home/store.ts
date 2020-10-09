const SET_SEARCH_TERM = 'HOME:SET_SEARCH_TERM';
const SET_SEARCHING = 'HOME:SET_SEARCHING';

const initialState: HomeReducer = {
	searching: false,
	searchTerm: null,
};

export function homeReducer(state: HomeReducer = initialState, action: DispatchAction<any>): HomeReducer {
	switch (action.type) {
		case SET_SEARCH_TERM:
			return {
				...state,
				searchTerm: action.value,
			};
		case SET_SEARCHING:
			return {
				...state,
				searching: action.value,
			};
	}

	return state;
}

// Actions //

export const setSearchTerm = (term: string) => (dispatch) => {
	dispatch({
		type: SET_SEARCH_TERM,
		value: term,
	});
};

export const setSearching = (value: boolean) => (dispatch) => {
	dispatch({
		value,
		type: SET_SEARCHING,
	});
};
