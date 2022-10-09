import * as React from 'react';
import { useSearchStore } from 'store/search';
import { OLSearch as Component } from './component';

export const OLSearch: React.FC = () => {
  const { isSearching, setIsSearching, setSearchTerm } = useSearchStore();

  return (
    <Component
      searching={isSearching}
      setSearching={setIsSearching}
      setSearchTerm={setSearchTerm}
    />
  );
};
