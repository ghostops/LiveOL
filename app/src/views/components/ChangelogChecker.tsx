import { useEffect, useState } from 'react';
import { $api } from '~/lib/react-query/api';
import { useChangelogStore } from '~/store/changelog';
import { useOLNavigationRef } from '~/hooks/useNavigation';

export const ChangelogChecker: React.FC = () => {
  const { getNavRef } = useOLNavigationRef();
  const { seenEntryIds, updateLastChecked } = useChangelogStore();
  const [hasChecked, setHasChecked] = useState(false);

  const { data } = $api.useQuery('get', '/v2/changelog', {
    params: { query: { limit: 10, offset: 0 } },
  });

  useEffect(() => {
    if (!data?.data.entries || hasChecked) {
      return;
    }

    const unseenEntries = data.data.entries.filter(
      entry => !seenEntryIds.includes(entry.id),
    );

    if (unseenEntries.length > 0) {
      setTimeout(() => {
        getNavRef()?.navigate('Changelog');
      }, 1000);
      updateLastChecked();
    }

    setHasChecked(true);
  }, [data, seenEntryIds, hasChecked, updateLastChecked, getNavRef]);

  return null;
};
