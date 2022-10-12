import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';

type AudioState = {
  isMuted: boolean;
  setMuted: (value: boolean) => void;
};

export const useAudioStore = create<AudioState>()(
  persist(
    set => ({
      isMuted: false,
      setMuted(value) {
        set(() => ({ isMuted: value }));
      },
    }),
    { name: '@liveol/audio', getStorage: () => AsyncStorage },
  ),
);
