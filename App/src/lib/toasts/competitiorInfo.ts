import { Toast } from 'native-base';

export const showToast = (name: string, club: string) => {
	Toast.show({
		text: `${name}\n${club}`,
		duration: 2000,
		position: 'bottom',
	});
};
