import { SectionList } from 'react-native';
import create from 'zustand';

type SearchState = {
  isSearching: boolean;
  searchTerm: string;
  setIsSearching: (value: boolean) => void;
  setSearchTerm: (value: string | null) => void;
  sectionListRef: SectionList | null;
  setSectionListRef: (value: SectionList) => void;
};

export const useSearchStore = create<SearchState>((set, get) => ({
  isSearching: false,
  searchTerm: '',
  setIsSearching(value) {
    if (get().sectionListRef?.props?.sections?.length) {
      get().sectionListRef?.scrollToLocation({
        animated: true,
        sectionIndex: 0,
        itemIndex: 0,
      });
    }

    set(() => ({ isSearching: value }));
  },
  setSearchTerm(value) {
    set(() => ({ searchTerm: value || '' }));
  },
  sectionListRef: null,
  setSectionListRef: sectionListRef => set({ sectionListRef }),
}));
