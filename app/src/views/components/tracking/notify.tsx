import { useTranslation } from 'react-i18next';
import { Switch, TouchableOpacity, View } from 'react-native';
import { useEnableNotifications } from '~/hooks/useEnableNotifications';
import { useIap } from '~/hooks/useIap';
import {
  NOTIFICATION_EVENTS,
  NotificationEvent,
  useNotificationSettings,
} from '~/hooks/useNotificationSettings';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { queryClient } from '~/lib/react-query/client';
import { useUserIdStore } from '~/store/userId';
import { COLORS } from '~/util/const';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';
import { useEventLabels } from '~/views/scenes/notifications';

type Props = {
  trackingId: number;
};

/** Notification settings for one followed runner, shown when editing them. */
export const OLTrackingNotifySettings = ({ trackingId }: Props) => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const userId = useUserIdStore(state => state.userId);
  const { presentPaywall } = useIap();
  const { settings } = useNotificationSettings();
  const { enable } = useEnableNotifications();
  const eventLabels = useEventLabels();

  const { data } = $api.useQuery(
    'get',
    '/v2/tracking',
    { params: { query: { uid: userId } } },
    { enabled: !!userId },
  );
  const tracking = data?.data.tracking.find(item => item.id === trackingId);

  const { mutateAsync: updateTracking, isPending } = $api.useMutation(
    'put',
    '/v2/tracking/{id}',
    {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['get', '/v2/tracking'] }),
    },
  );

  if (!tracking || !settings) {
    return null;
  }

  const save = (changes: {
    notify?: boolean;
    notifyEvents?: NotificationEvent[] | null;
  }) =>
    updateTracking({
      params: { path: { id: trackingId } },
      body: { name: tracking.name, clubs: tracking.clubs, ...changes },
    }).catch(error => {
      __DEV__ && console.warn('[Tracking] Failed to update notify', error);
    });

  const globalEvents = NOTIFICATION_EVENTS.filter(
    event =>
      settings.allowedEvents.includes(event) && settings.prefs.events[event],
  );
  const customEvents = tracking.notifyEvents;
  const rowStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: px(12),
    paddingVertical: px(8),
  };

  if (tracking.locked) {
    return (
      <TouchableOpacity onPress={presentPaywall} style={rowStyle}>
        <OLText size={14} style={{ flex: 1, color: COLORS.GRAY }}>
          {t('Following more than one runner requires LiveOL+')}
        </OLText>
        <OLIcon name="lock-closed" size={16} color={COLORS.MAIN} />
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <OLText size={16} bold style={{ marginBottom: px(4) }}>
        {t('Notifications')}
      </OLText>

      {!settings.prefs.enabled ? (
        <TouchableOpacity onPress={() => enable()} style={rowStyle}>
          <OLText size={14} style={{ flex: 1, color: COLORS.GRAY }}>
            {t('Notifications are turned off')}
          </OLText>
          <OLText size={14} bold style={{ color: COLORS.MAIN }}>
            {t('Turn on')}
          </OLText>
        </TouchableOpacity>
      ) : (
        <>
          <View style={rowStyle}>
            <OLText size={16} style={{ flex: 1 }}>
              {t('Notify me about this runner')}
            </OLText>
            <Switch
              value={tracking.notify}
              disabled={isPending}
              onValueChange={notify => {
                save({ notify });
              }}
              trackColor={{ true: COLORS.MAIN }}
            />
          </View>

          {tracking.notify &&
            (settings.isPlus ? (
              <>
                <View style={rowStyle}>
                  <OLText size={16} style={{ flex: 1 }}>
                    {t('Use my notification settings')}
                  </OLText>
                  <Switch
                    value={!customEvents}
                    disabled={isPending}
                    onValueChange={useGlobal => {
                      save({ notifyEvents: useGlobal ? null : globalEvents });
                    }}
                    trackColor={{ true: COLORS.MAIN }}
                  />
                </View>
                {customEvents &&
                  NOTIFICATION_EVENTS.map(event => (
                    <View
                      key={event}
                      style={[rowStyle, { paddingLeft: px(12) }]}
                    >
                      <OLText size={14} style={{ flex: 1 }}>
                        {eventLabels[event]}
                      </OLText>
                      <Switch
                        value={customEvents.includes(event)}
                        disabled={isPending}
                        onValueChange={on => {
                          save({
                            notifyEvents: on
                              ? [...customEvents, event]
                              : customEvents.filter(e => e !== event),
                          });
                        }}
                        trackColor={{ true: COLORS.MAIN }}
                      />
                    </View>
                  ))}
              </>
            ) : (
              <TouchableOpacity onPress={presentPaywall} style={rowStyle}>
                <OLText size={14} style={{ flex: 1, color: COLORS.GRAY }}>
                  {t('Choose notifications per runner with LiveOL+')}
                </OLText>
                <OLIcon name="lock-closed" size={16} color={COLORS.MAIN} />
              </TouchableOpacity>
            ))}
        </>
      )}
    </View>
  );
};
