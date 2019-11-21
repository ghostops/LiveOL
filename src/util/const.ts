import { Dimensions, PixelRatio } from 'react-native';
const window = Dimensions.get('window');

export const DeviceOrientationAprox = (): 'landscape' | 'portrait' => {
    const window = Dimensions.get('window');
    const min = Math.min(window.width, window.height);
    return min === window.width ? 'portrait' : 'landscape';
};

export const PACKAGE = require('../../package.json');
export const APP = require('../../app.json');
export const VERSION = PACKAGE.version;
export const APP_VERSION = APP.expo.version;
export const ANDROID_VERSION_CODE = APP.expo.android.versionCode;

export const COLORS = {
    MAIN: '#e86a1e',
    LIGHT: '#ff7f32',
    DARK: '#b25115',
};

export const HIT_SLOP = { top: 10, left: 10, right: 10, bottom: 10 };

export const WINDOW_WIDTH = Math.min(window.width, window.height);
const STANDARD_WINDOW_WIDTH = 450;
const RESPONSIVE_UNIT = WINDOW_WIDTH / 350;

export const BASE_UNIT = 16;
export const SIZE_RATIO = WINDOW_WIDTH / STANDARD_WINDOW_WIDTH;
export const UNIT = BASE_UNIT * RESPONSIVE_UNIT;

export const FONT_UNIT = BASE_UNIT * (1 + (1 - PixelRatio.getFontScale()));

export const px = (pixels: number) => UNIT * (pixels / BASE_UNIT);
export const fontPx = (pixels: number) => FONT_UNIT * (pixels / BASE_UNIT);
