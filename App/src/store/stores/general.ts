export const SET_ROTATION = 'GENERAL:SET_ROTATION';
export const SET_MUTE = 'GENERAL:SET_MUTE';

const initialState: GeneralReducer = {
	rotation: null,
	audioMuted: false,
};

export function generalReducer(state: GeneralReducer = initialState, action: DispatchAction<any>): GeneralReducer {
	switch (action.type) {
		case SET_ROTATION:
			return {
				...state,
				rotation: action.value,
			};
		case SET_MUTE:
			return {
				...state,
				audioMuted: action.value,
			};
	}

	return state;
}

export const setRotation = (rotation: string) => (dispatch, getState: GetState) => {
	const currentRotation = getState().general.rotation;

	if (rotation === currentRotation) return;

	dispatch({
		type: SET_ROTATION,
		value: rotation,
	});
};

export const toggleMute = () => (dispatch, getState: GetState) => {
	const muteValue = getState().general.audioMuted;

	dispatch({
		type: SET_MUTE,
		value: !muteValue,
	});
};
