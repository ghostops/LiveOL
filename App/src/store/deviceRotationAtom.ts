import { atom } from 'recoil';

export const deviceRotationAtom = atom<'landscape' | 'portrait'>({
	default: 'portrait',
	key: 'deviceRotation',
});
