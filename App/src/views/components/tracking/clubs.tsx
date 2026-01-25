import { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { OLTrackingDropdown } from './dropdown';
import { useDebounce } from 'use-debounce';

export const OLClubsTrackingInput = ({
  onAddClub,
}: {
  onAddClub: (club: string) => void;
}) => {
  const { px } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 300);

  // Fetch organizations with server-side search
  const { data } = $api.useQuery('get', '/v2/strings/organizations', {
    params: {
      query: {
        search: debouncedSearchText || undefined,
        limit: 100,
      },
    },
  });

  // Memoize the organizations array to prevent re-creating on every render
  const organizations = useMemo(
    () => data?.data.organizations || null,
    [data?.data.organizations],
  );

  const addClub = useCallback(
    (clubInput: string) => {
      onAddClub(clubInput);
      setSearchText(''); // Clear search after adding
    },
    [onAddClub],
  );

  return (
    <View style={{ flexDirection: 'row', gap: px(4) }}>
      <OLTrackingDropdown
        dataSet={organizations}
        onAddItem={addClub}
        onChangeText={setSearchText}
      />
    </View>
  );
};
