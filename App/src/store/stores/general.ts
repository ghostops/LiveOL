import { Orientation } from 'expo-screen-orientation';

export const SET_ROTATION = 'GENERAL:SET_ROTATION';

const initialState: GeneralReducer = {
    rotation: null,
};

export function generalReducer(
    state: GeneralReducer = initialState,
    action: DispatchAction<any>,
): GeneralReducer {
    switch (action.type) {
    case SET_ROTATION:
        return {
            ...state,
            rotation: action.value,
        };
    }

    return state;
}

export const setRotation = (rotation: Orientation) => (dispatch) => {
    dispatch({
        type: SET_ROTATION,
        value: rotation,
    });
};
