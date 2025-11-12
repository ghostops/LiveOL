import { $api } from '~/lib/react-query/api';
import { useDeviceIdStore } from '~/store/deviceId';

/**
 * Hook to fetch and cache user data based on device ID
 *
 * @param enabled - Whether to enable the query (default: true)
 * @returns React Query result with user data
 */
export const useUser = (enabled: boolean = true) => {
  const deviceId = useDeviceIdStore(state => state.deviceId);

  return $api.useQuery(
    'get',
    '/v2/users',
    {
      params: {
        query: {
          deviceId,
        },
      },
    },
    {
      enabled: enabled && !!deviceId,
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      retry: 2,
    },
  );
};
