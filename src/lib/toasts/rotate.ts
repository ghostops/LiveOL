import { Toast } from 'native-base';
import { Cache } from 'lib/cache';
import { Lang } from 'lib/lang';
import { store } from 'store/configure';
import { ScreenOrientation } from 'expo';
import ms from 'ms';

export const showToast = async () => {
    const cache = new Cache('rotation_toast', ms('12 hours'));

    const value = await cache.get();

    const state = store.store.getState() as AppState;

    if (
        value !== 'seen' &&
        state.general.rotation !== ScreenOrientation.Orientation.LANDSCAPE
    ) {
        Toast.show({
            text: Lang.print('promotions.rotate'),
            duration: 3000,
            position: 'bottom',
            type: 'warning',
            textStyle: { color: 'black' },
        });

        await cache.set('seen');
    }
};
