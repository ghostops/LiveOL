import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandAsyncStorage } from './asyncStorage';

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
    { name: '@liveol/text', storage: zustandAsyncStorage },
  ),
);
