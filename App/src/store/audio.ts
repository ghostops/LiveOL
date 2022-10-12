import create from 'zustand';

type AudioState = {
  isMuted: boolean;
  setMuted: (value: boolean) => void;
};

export const useAudioStore = create<AudioState>(set => ({
  isMuted: false,
  setMuted(value) {
    set(() => ({ isMuted: value }));
  },
}));
