import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandAsyncStorage } from './asyncStorage';

type HintEntry = {
  value: string;
  expiresAt?: number; // Unix timestamp in ms
};

type HintsState = {
  hints: Record<string, HintEntry>;
  setHint: (key: string, value: string, ttlMs?: number) => void;
  getHint: (key: string) => string | undefined;
  removeHint: (key: string) => void;
};

export const useHintsStore = create<HintsState>()(
  persist(
    (set, get) => ({
      hints: {},
      setHint(key, value, ttlMs) {
        const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
        set(state => ({
          hints: { ...state.hints, [key]: { value, expiresAt } },
        }));
      },
      getHint(key) {
        const entry = get().hints[key];
        if (!entry) {
          return undefined;
        }

        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          // Remove expired hint
          get().removeHint(key);
          return undefined;
        }

        return entry.value;
      },
      removeHint(key) {
        set(state => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _, ...rest } = state.hints;
          return { hints: rest };
        });
      },
    }),
    { name: '@liveol/hints', storage: zustandAsyncStorage },
  ),
);
