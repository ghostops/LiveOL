import { Notification } from 'expo/build/Notifications/Notifications.types';

export const SET_ROTATION = 'GENERAL:SET_ROTATION';
export const SET_EXPO_PUSH_TOKEN = 'GENERAL:SET_EXPO_PUSH_TOKEN';

const initialState: GeneralReducer = {
	rotation: null,
	expoPushToken: null,
};

export function generalReducer(state: GeneralReducer = initialState, action: DispatchAction<any>): GeneralReducer {
	switch (action.type) {
		case SET_ROTATION:
			return {
				...state,
				rotation: action.value,
			};
		case SET_EXPO_PUSH_TOKEN:
			return {
				...state,
				rotation: action.value,
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

export const setExpoPushToken = (token: string) => (dispatch) => {
	dispatch({
		type: SET_EXPO_PUSH_TOKEN,
		value: token,
	});
};

export const handleNotification = (notification: Notification) => () => {
	console.log(notification);
};
