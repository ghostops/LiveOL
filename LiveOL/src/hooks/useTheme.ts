import { px, fontPx, HIT_SLOP, COLORS } from 'util/const';

export const useTheme = () => {
  return {
    px,
    fontPx,
    hitSlop: HIT_SLOP,
    colors: COLORS,
  };
};
