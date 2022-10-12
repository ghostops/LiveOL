import create from 'zustand';

type SearchState = {
  isSearching: boolean;
  searchTerm: string;
  setIsSearching: (value: boolean) => void;
  setSearchTerm: (value: string | null) => void;
};

export const useSearchStore = create<SearchState>(set => ({
  isSearching: false,
  searchTerm: '',
  setIsSearching(value) {
    set(() => ({ isSearching: value }));
  },
  setSearchTerm(value) {
    set(() => ({ searchTerm: value || '' }));
  },
}));
