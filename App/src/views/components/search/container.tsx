import * as React from 'react';
import { useSearchStore } from 'store/search';
import { OLSearch as Component } from './component';

export const OLSearch: React.FC = () => {
  const { setIsSearching, setSearchTerm } = useSearchStore();

  return (
    <Component setSearching={setIsSearching} setSearchTerm={setSearchTerm} />
  );
};
