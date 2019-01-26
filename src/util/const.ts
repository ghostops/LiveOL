import { Dimensions } from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const RESPONSIVE_UNIT = WINDOW_WIDTH / 350;

export const PACKAGE = require('../../package.json');
export const APP = require('../../app.json');
export const VERSION = PACKAGE.version;
export const APP_VERSION = APP.expo.version;

export const UNIT = 16 * RESPONSIVE_UNIT;
export const COLORS = {
    MAIN: '#e86a1e',
    DARK: '#b25115',
};

export const HIT_SLOP = { top: 10, left: 10, right: 10, bottom: 10 };
