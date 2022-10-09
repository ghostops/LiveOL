import create from 'zustand';

type TextState = {
  textSizeMultiplier: number;
  setTextSizeMultiplier: (value: number) => void;
};

export const useTextStore = create<TextState>(set => ({
  textSizeMultiplier: 1,
  setTextSizeMultiplier(value) {
    set(() => ({ textSizeMultiplier: value }));
  },
}));
