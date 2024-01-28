import * as React from 'react';
import { useSearchStore } from '~/store/search';
import { OLSearch as Component } from './component';

export const OLSearch: React.FC = () => {
  const setIsSearching = useSearchStore(state => state.setIsSearching);
  const setSearchTerm = useSearchStore(state => state.setSearchTerm);

  return (
    <Component setSearching={setIsSearching} setSearchTerm={setSearchTerm} />
  );
};
