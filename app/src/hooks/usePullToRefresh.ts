import { useCallback, useState } from 'react';

// Spinner state for RefreshControl that only reflects refreshes the user
// pulled for. React Query's isRefetching is also true for background
// refetches (app foreground, screen focus), which would show the spinner.
export const usePullToRefresh = (refetch: () => Promise<unknown>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
};
