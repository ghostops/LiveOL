import React from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { isMutedAtom } from 'store/isMutedAtom';
import { useRecoilValue } from 'recoil';

const Tracks = [
	require('../../../../../assets/sound/alert1.mp3'),
	require('../../../../../assets/sound/alert2.mp3'),
	require('../../../../../assets/sound/alert3.mp3'),
	require('../../../../../assets/sound/alert4.mp3'),
];

export const usePlayAudio = (track = 3) => {
	const [sound, setSound] = React.useState<Audio.Sound>();
	const muted = useRecoilValue(isMutedAtom);

	React.useEffect(() => {
		return () => {
			if (!sound) return;
			void sound.unloadAsync();
		};
	}, [sound]);

	return React.useCallback(async () => {
		if (muted || Platform.OS === 'android') return;

		const { sound } = await Audio.Sound.createAsync(Tracks[track]);

		setSound(sound);

		await sound.playAsync();
	}, [sound, muted]);
};
