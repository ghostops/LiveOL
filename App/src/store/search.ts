import create from 'zustand';

type SearchState = {
  isSearching: boolean;
  searchTerm: string;
  setIsSearching: (value: boolean) => void;
  setSearchTerm: (value: string | null) => void;
  sectionListRef: any;
  setSectionListRef: (value: any) => void;
};

export const useSearchStore = create<SearchState>((set, get) => ({
  isSearching: false,
  searchTerm: '',
  setIsSearching(value) {
    get().sectionListRef?.scrollToLocation({
      animated: true,
      sectionIndex: 0,
      itemIndex: 0,
    });
    set(() => ({ isSearching: value }));
  },
  setSearchTerm(value) {
    set(() => ({ searchTerm: value || '' }));
  },
  sectionListRef: null,
  setSectionListRef: sectionListRef => set({ sectionListRef }),
}));
