import { $api } from '~/lib/react-query/api';
import { useUserIdStore } from '~/store/userId';

/** Free users may follow one runner besides themselves; the server enforces it. */
export const useFollowLimit = () => {
  const userId = useUserIdStore(state => state.userId);

  const { data } = $api.useQuery(
    'get',
    '/v2/tracking',
    { params: { query: { uid: userId } } },
    { enabled: !!userId },
  );

  const limits = data?.data.limits;

  return {
    // Unknown until loaded; let the server decide rather than block
    canFollowMore:
      !limits ||
      limits.maxFollowed === null ||
      limits.followedCount < limits.maxFollowed,
    maxFollowed: limits?.maxFollowed ?? null,
  };
};
