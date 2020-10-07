import { Cache } from 'lib/cache';
import { Lang } from 'lib/lang';
import { store } from 'store/configure';
import { Toast } from 'native-base';
import ms from 'ms';

export const showToast = async () => {
    const cache = new Cache('rotation_toast', ms('12 hours'));

    const value = await cache.get();

    const state = store.store.getState() as AppState;

    if (
        value !== 'seen' &&
        state.general.rotation !== 'landscape'
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
