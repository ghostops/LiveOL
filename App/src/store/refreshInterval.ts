import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandAsyncStorage } from './asyncStorage';

type RefreshIntervalState = {
  refreshIntervalMs: number;
  setRefreshIntervalMs: (value: number) => void;
};

export const useRefreshIntervalStore = create<RefreshIntervalState>()(
  persist(
    set => ({
      setRefreshIntervalMs: refreshIntervalMs => set({ refreshIntervalMs }),
      refreshIntervalMs: 15_000,
    }),
    { name: '@liveol/refreshInterval', storage: zustandAsyncStorage },
  ),
);
