import { useCallback } from 'react';
import { $api } from '~/lib/react-query/api';
import { queryClient } from '~/lib/react-query/client';
import { paths } from '~/lib/react-query/schema';
import { useUserIdStore } from '~/store/userId';

export type NotificationSettings =
  paths['/v2/notifications/settings']['get']['responses']['200']['content']['application/json']['data'];

export type NotificationEvent = NotificationSettings['allowedEvents'][number];

type SettingsUpdate = Omit<
  NonNullable<
    paths['/v2/notifications/settings/update']['post']['requestBody']
  >['content']['application/json'],
  'uid'
>;

export const NOTIFICATION_EVENTS: NotificationEvent[] = [
  'finish',
  'split',
  'start',
  'status',
  'placeChange',
];

const settingsQueryKey = ['get', '/v2/notifications/settings'];

export const useNotificationSettings = () => {
  const userId = useUserIdStore(state => state.userId);

  const { data, isLoading, refetch } = $api.useQuery(
    'get',
    '/v2/notifications/settings',
    { params: { query: { uid: userId } } },
    { enabled: !!userId },
  );

  const { mutateAsync, isPending } = $api.useMutation(
    'post',
    '/v2/notifications/settings/update',
    {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: settingsQueryKey }),
    },
  );

  const update = useCallback(
    async (changes: SettingsUpdate) => {
      try {
        const response = await mutateAsync({
          body: { uid: userId, ...changes },
        });
        return response.data;
      } catch (error) {
        // Locked options are not selectable in the UI; the server is the backstop
        __DEV__ && console.warn('[Notifications] Update failed', error);
        return null;
      }
    },
    [mutateAsync, userId],
  );

  return {
    settings: data?.data,
    isLoading,
    isUpdating: isPending,
    update,
    refetch,
  };
};
