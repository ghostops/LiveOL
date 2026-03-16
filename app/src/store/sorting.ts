import { create } from 'zustand';

type SortingState = {
  sortingKey: string;
  sortingDirection: 'asc' | 'desc';
  setSortingKey: (key: string) => void;
  setSortingDirection: (key: 'asc' | 'desc') => void;
};

export const useSortingStore = create<SortingState>()(set => ({
  sortingKey: 'place',
  sortingDirection: 'asc',
  setSortingKey: sortingKey => set({ sortingKey }),
  setSortingDirection: sortingDirection => set({ sortingDirection }),
}));
