import * as React from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isSearchingAtom } from 'store/isSearchingAtom';
import { searchTermAtom } from 'store/searchTermAtom';
import { OLSearch as Component } from './component';

export const OLSearch: React.FC = () => {
	const [isSearching, setIsSearching] = useRecoilState(isSearchingAtom);
	const setSearchTerm = useSetRecoilState(searchTermAtom);

	return <Component searching={isSearching} setSearching={setIsSearching} setSearchTerm={setSearchTerm} />;
};
