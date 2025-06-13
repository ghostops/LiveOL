import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TextState = {
  textSizeMultiplier: number;
  setTextSizeMultiplier: (value: number) => void;
};

export const useTextStore = create<TextState>()(
  persist(
    set => ({
      textSizeMultiplier: 1,
      setTextSizeMultiplier(value) {
        set(() => ({ textSizeMultiplier: value }));
      },
    }),
    { name: '@liveol/text', getStorage: () => AsyncStorage },
  ),
);
