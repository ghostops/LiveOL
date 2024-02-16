import * as React from 'react';
import { useHomeSearchStore } from '~/store/homeSearch';
import { OLSearch as Component } from './component';

export const OLSearch: React.FC = () => {
  const setIsSearching = useHomeSearchStore(state => state.setIsSearching);
  const setSearchTerm = useHomeSearchStore(state => state.setSearchTerm);

  return (
    <Component setSearching={setIsSearching} setSearchTerm={setSearchTerm} />
  );
};
