import { selector } from 'recoil';
import { deviceRotationAtom } from './deviceRotationAtom';

export const isLandscapeSelector = selector<boolean>({
	key: 'isLandscape',
	get: ({ get }) => {
		const rotation = get(deviceRotationAtom);
		return rotation === 'landscape';
	},
});
