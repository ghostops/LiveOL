import { atom } from 'recoil';
import ReactNativeRecoilPersist from 'react-native-recoil-persist';

export const isMutedAtom = atom<boolean>({
	default: false,
	key: 'isMuted',
	effects_UNSTABLE: [ReactNativeRecoilPersist.persistAtom],
});
