import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandAsyncStorage } from './asyncStorage';

type ChangelogState = {
  seenEntryIds: number[];
  lastCheckedAt: number;
  markAsSeen: (entryIds: number[]) => void;
  hasSeenEntry: (entryId: number) => boolean;
  updateLastChecked: () => void;
};

export const useChangelogStore = create<ChangelogState>()(
  persist(
    (set, get) => ({
      seenEntryIds: [],
      lastCheckedAt: 0,
      markAsSeen(entryIds) {
        set(state => ({
          seenEntryIds: [...new Set([...state.seenEntryIds, ...entryIds])],
        }));
      },
      hasSeenEntry(entryId) {
        return get().seenEntryIds.includes(entryId);
      },
      updateLastChecked() {
        set({ lastCheckedAt: Date.now() });
      },
    }),
    { name: '@liveol/changelog', storage: zustandAsyncStorage },
  ),
);
