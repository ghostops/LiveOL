import { atom } from 'recoil';

export const isMutedAtom = atom<boolean>({
	default: false,
	key: 'isMuted',
});
