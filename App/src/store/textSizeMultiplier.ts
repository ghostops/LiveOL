import { atom } from 'recoil';
import ReactNativeRecoilPersist from 'react-native-recoil-persist';

export const textSizeMultiplierAtom = atom<number>({
	default: 1,
	key: 'textSizeMultiplier',
	effects_UNSTABLE: [ReactNativeRecoilPersist.persistAtom],
});
