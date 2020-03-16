const SET_VISIBLE_COMPETITIONS = 'HOME:SET_VISIBLE_COMPETITIONS';
const SET_SEARCHING = 'HOME:SET_SEARCHING';

const initialState: HomeReducer = {
    visibleCompetitions: null,
    searching: false,
};

export function homeReducer(
    state: HomeReducer = initialState,
    action: DispatchAction<any>,
): HomeReducer {
    switch (action.type) {
    case SET_VISIBLE_COMPETITIONS:
        return {
            ...state,
            visibleCompetitions: action.value,
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

export const setVisibleCompetitions = (competitions: Comp[]) => (dispatch) => {
    dispatch({
        type: SET_VISIBLE_COMPETITIONS,
        value: competitions,
    });
};

export const setSearching = (value: boolean) => (dispatch) => {
    dispatch({
        value,
        type: SET_SEARCHING,
    });
};
