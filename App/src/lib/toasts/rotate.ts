import { Cache } from 'lib/cache';
import { Lang } from 'lib/lang';
import { store } from 'store/configure';
import Toast from 'react-native-toast-message';
import ms from 'ms';

export const showToast = async () => {
	if (__DEV__) return;

	const cache = new Cache('rotation_toast', ms('5 days'));

	const value = await cache.get();

	const state = store.store.getState() as AppState;

	if (value !== 'seen' && state.general.rotation !== 'landscape') {
		Toast.show({
			text1: Lang.print('promotions.rotate'),
			visibilityTime: 3000,
			position: 'bottom',
			type: 'info',
		});

		await cache.set('seen');
	}
};
