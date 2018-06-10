import { Dimensions } from 'react-native';
const WINDOW_WIDTH = Dimensions.get('window').width;
const RESPONSIVE_UNIT = WINDOW_WIDTH / 350;

export const UNIT = 16 * RESPONSIVE_UNIT;
