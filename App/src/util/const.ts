import { Dimensions, PixelRatio } from 'react-native';
import { scale } from 'react-native-size-matters';

export const DeviceOrientationAprox = (): 'landscape' | 'portrait' => {
  const window = Dimensions.get('window');
  const min = Math.min(window.width, window.height);
  return min === window.width ? 'portrait' : 'landscape';
};

export const PACKAGE = require('../../package.json');
export const VERSION: string = PACKAGE.version;

export const COLORS = {
  MAIN: '#e86a1e',
  LIGHT: '#ff7f32',
  DARK: '#b25115',
  BORDER: '#e6e6e6',
};

export const HIT_SLOP = { top: 10, left: 10, right: 10, bottom: 10 };

const BASE_UNIT = 16;

const FONT_UNIT = BASE_UNIT * (1 + (1 - PixelRatio.getFontScale()));

export const px = (pixels: number) => scale(pixels);
export const fontPx = (pixels: number) => FONT_UNIT * (pixels / BASE_UNIT);
