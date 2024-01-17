import { useCallback, useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import { Platform } from 'react-native';
import { useAudioStore } from '~/store/audio';

const Tracks = [
  require('../../../../../assets/sound/alert1.mp3'),
  require('../../../../../assets/sound/alert2.mp3'),
  require('../../../../../assets/sound/alert3.mp3'),
  require('../../../../../assets/sound/alert4.mp3'),
];

export const usePlayAudio = (track = 3) => {
  const { isMuted } = useAudioStore();

  useEffect(() => {
    TrackPlayer.setupPlayer().catch(() => {});
  }, []);

  return useCallback(async () => {
    if (isMuted || Platform.OS === 'android') {
      return;
    }

    await TrackPlayer.add({ url: Tracks[track] });
    await TrackPlayer.play();
  }, [isMuted, track]);
};
