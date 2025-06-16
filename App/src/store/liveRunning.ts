import { create } from 'zustand';

type LiveRunningState = {
  tick: number;
  runTick: () => void;
  startTicking: () => void;
  stopTicking: () => void;
};

let ticker: number | undefined;

export const useLiveRunningStore = create<LiveRunningState>()((set, get) => ({
  tick: 0,
  runTick: () => {
    const current = get().tick;
    if (current > 86400) {
      set({ tick: 0 });
      return;
    }
    set({ tick: get().tick + 1 });
  },
  startTicking: () => {
    if (ticker) {
      return;
    }

    ticker = setInterval(() => {
      get().runTick();
    }, 1000);
  },
  stopTicking: () => {
    if (!ticker) {
      return;
    }

    clearInterval(ticker);
    ticker = undefined;
  },
}));
