import { create } from 'zustand';

type SearchState = {
  searchTerm: string | undefined;
  setSearchTerm: (value: string | undefined) => void;
};

export const useResultSearchStore = create<SearchState>(set => ({
  searchTerm: undefined,
  setSearchTerm(value) {
    set(() => ({ searchTerm: value || '' }));
  },
}));
