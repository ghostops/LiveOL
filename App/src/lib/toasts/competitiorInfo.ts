import Toast from 'react-native-toast-message';

export const showToast = (name: string, club: string) => {
	Toast.show({
		type: 'info',
		text1: name,
		text2: club,
		visibilityTime: 2000,
		position: 'bottom',
	});
};
