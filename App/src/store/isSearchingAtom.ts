import { atom } from 'recoil';

export const isSearchingAtom = atom<boolean>({
	default: false,
	key: 'isSearching',
});
