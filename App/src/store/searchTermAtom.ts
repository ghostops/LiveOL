import { atom } from 'recoil';

export const searchTermAtom = atom<string>({
	default: '',
	key: 'searchTerm',
});
