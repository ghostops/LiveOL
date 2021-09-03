import { Cache } from 'lib/cache';
import Toast from 'react-native-toast-message';
import ms from 'ms';
import { Lang } from 'lib/lang';
import { isLandscapeSelector } from 'store/isLandscapeSelector';
import { getRecoil } from 'recoil-nexus';

export const showToast = async () => {
	if (__DEV__) return;

	const cache = new Cache('rotation_toast', ms('5 days'));

	const value = await cache.get();

	const isLandscape = getRecoil(isLandscapeSelector);

	if (value !== 'seen' && !isLandscape) {
		Toast.show({
			text1: Lang.print('promotions.rotate'),
			visibilityTime: 3000,
			position: 'bottom',
			type: 'info',
		});

		await cache.set('seen');
	}
};
