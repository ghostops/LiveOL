import { Dimensions } from 'react-native';
const window = Dimensions.get('window');

export const DeviceOrientationAprox = (): 'landscape' | 'portrait' => {
    const window = Dimensions.get('window');
    const min = Math.min(window.width, window.height);
    return min === window.width ? 'portrait' : 'landscape';
};

export const WINDOW_WIDTH = Math.min(window.width, window.height);
const RESPONSIVE_UNIT = WINDOW_WIDTH / 350;

export const PACKAGE = require('../../package.json');
export const APP = require('../../app.json');
export const VERSION = PACKAGE.version;
export const APP_VERSION = APP.expo.version;
export const ANDROID_VERSION_CODE = APP.expo.android.versionCode;

export const UNIT = 16 * RESPONSIVE_UNIT;
export const COLORS = {
    MAIN: '#e86a1e',
    LIGHT: '#ff7f32',
    DARK: '#b25115',
};

export const HIT_SLOP = { top: 10, left: 10, right: 10, bottom: 10 };
