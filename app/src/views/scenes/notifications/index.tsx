import { useActionSheet } from '@expo/react-native-action-sheet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { getTimeZone } from 'react-native-localize';
import { useEnableNotifications } from '~/hooks/useEnableNotifications';
import { useIap } from '~/hooks/useIap';
import {
  NOTIFICATION_EVENTS,
  NotificationEvent,
  useNotificationSettings,
} from '~/hooks/useNotificationSettings';
import { canReceivePush } from '~/lib/push';
import { syncPushRegistration } from '~/lib/push/registration';
import { $fetch } from '~/lib/react-query/api';
import { useUserIdStore } from '~/store/userId';
import { usePushStore } from '~/store/push';
import { COLORS, px } from '~/util/const';
import { OLButton } from '~/views/components/button';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';

const DEFAULT_QUIET_HOURS = { from: '22:00', to: '07:00' };
const HOURS = Array.from(
  { length: 24 },
  (_, h) => `${String(h).padStart(2, '0')}:00`,
);

export const useEventLabels = (): Record<NotificationEvent, string> => {
  const { t } = useTranslation();
  return {
    finish: t('Finishes'),
    split: t('Passes a split control'),
    start: t('Starts'),
    status: t('Does not finish, mispunches or is disqualified'),
    placeChange: t('Changes place after finishing'),
  };
};

export const OLSceneNotificationSettings = () => {
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const { presentPaywall } = useIap();
  const { settings, isLoading, isUpdating, update } = useNotificationSettings();
  const { enable, openSystemSettings } = useEnableNotifications();
  const permissionStatus = usePushStore(state => state.permissionStatus);
  const eventLabels = useEventLabels();
  const userId = useUserIdStore(state => state.userId);
  const [isSendingTest, setIsSendingTest] = useState(false);

  if (isLoading || !settings) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.MAIN} />
      </View>
    );
  }

  const { prefs, allowedEvents, isPlus } = settings;
  const enabled = prefs.enabled;
  const permissionBlocked = enabled && !canReceivePush(permissionStatus);

  const toggleEnabled = async (value: boolean) => {
    if (value) {
      await enable();
    } else {
      await update({ enabled: false });
    }
  };

  const sendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      // Make sure the server has this device's current token first
      await syncPushRegistration(userId);
      const { data, response } = await $fetch.POST(
        '/v2/notifications/push/test',
        { body: { uid: userId } },
      );
      if (response.status === 429) {
        Alert.alert(t('Wait a moment before sending another test'));
      } else if (!data || data.data.sent === 0) {
        Alert.alert(
          t('No notification sent'),
          t('This device is not registered for notifications yet.'),
        );
      } else {
        Alert.alert(
          t('Test notification sent'),
          t('It should arrive within a few seconds.'),
        );
      }
    } catch {
      Alert.alert(t('Could not send a test notification'));
    } finally {
      setIsSendingTest(false);
    }
  };

  const pickHour = (key: 'from' | 'to') => {
    const quietHours = prefs.quietHours;
    if (!quietHours) {
      return;
    }
    showActionSheetWithOptions(
      {
        options: [...HOURS, t('Cancel')],
        cancelButtonIndex: HOURS.length,
        title: key === 'from' ? t('From') : t('To'),
      },
      index => {
        if (index === undefined || index >= HOURS.length) {
          return;
        }
        update({ quietHours: { ...quietHours, [key]: HOURS[index] } });
      },
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: px(64) }}
    >
      {permissionBlocked && (
        <View style={styles.banner}>
          <OLText size={14} style={{ color: COLORS.WHITE, flex: 1 }}>
            {t('Notifications are off in system settings')}
          </OLText>
          <OLButton
            small
            onPress={openSystemSettings}
            style={{ backgroundColor: COLORS.DARK }}
          >
            {t('Open settings')}
          </OLButton>
        </View>
      )}

      <View style={[styles.item, { marginTop: px(8) }]}>
        <OLText size={16}>{t('Notifications')}</OLText>
        <Switch
          value={enabled}
          onValueChange={toggleEnabled}
          disabled={isUpdating}
          trackColor={{ true: COLORS.MAIN }}
        />
      </View>

      {enabled && !permissionBlocked && (
        <TouchableOpacity
          style={styles.item}
          onPress={sendTestNotification}
          disabled={isSendingTest}
        >
          <OLText size={16} style={{ color: COLORS.MAIN }}>
            {t('Send test notification')}
          </OLText>
          {isSendingTest && <ActivityIndicator color={COLORS.MAIN} />}
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <OLText bold size={14}>
          {t('Notify me when a runner I follow')}
        </OLText>
      </View>

      {NOTIFICATION_EVENTS.map(event => {
        const allowed = allowedEvents.includes(event);
        if (!allowed) {
          return (
            <TouchableOpacity
              key={event}
              style={styles.item}
              onPress={presentPaywall}
            >
              <OLText size={16} style={styles.label}>
                {eventLabels[event]}
              </OLText>
              <View style={styles.locked}>
                <OLIcon name="lock-closed" size={16} color={COLORS.MAIN} />
                <OLText size={14} bold style={{ color: COLORS.MAIN }}>
                  LiveOL+
                </OLText>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <View
            key={event}
            style={[styles.item, { opacity: enabled ? 1 : 0.5 }]}
          >
            <OLText size={16} style={styles.label}>
              {eventLabels[event]}
            </OLText>
            <Switch
              value={prefs.events[event] ?? false}
              disabled={!enabled || isUpdating}
              onValueChange={value => {
                update({ events: { [event]: value } });
              }}
              trackColor={{ true: COLORS.MAIN }}
            />
          </View>
        );
      })}

      <View style={styles.header}>
        <OLText bold size={14}>
          {t('Quiet hours')}
        </OLText>
      </View>

      {isPlus ? (
        <>
          <View style={[styles.item, { opacity: enabled ? 1 : 0.5 }]}>
            <OLText size={16} style={styles.label}>
              {t('Pause notifications at night')}
            </OLText>
            <Switch
              value={!!prefs.quietHours}
              disabled={!enabled || isUpdating}
              onValueChange={value => {
                update({
                  quietHours: value
                    ? { ...DEFAULT_QUIET_HOURS, timezone: getTimeZone() }
                    : null,
                });
              }}
              trackColor={{ true: COLORS.MAIN }}
            />
          </View>
          {prefs.quietHours && (
            <>
              <TouchableOpacity
                style={styles.item}
                onPress={() => pickHour('from')}
              >
                <OLText size={16}>{t('From')}</OLText>
                <OLText size={16} mono style={{ color: COLORS.GRAY }}>
                  {prefs.quietHours.from}
                </OLText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.item}
                onPress={() => pickHour('to')}
              >
                <OLText size={16}>{t('To')}</OLText>
                <OLText size={16} mono style={{ color: COLORS.GRAY }}>
                  {prefs.quietHours.to}
                </OLText>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        <TouchableOpacity style={styles.item} onPress={presentPaywall}>
          <OLText size={16} style={styles.label}>
            {t('Pause notifications at night')}
          </OLText>
          <View style={styles.locked}>
            <OLIcon name="lock-closed" size={16} color={COLORS.MAIN} />
            <OLText size={14} bold style={{ color: COLORS.MAIN }}>
              LiveOL+
            </OLText>
          </View>
        </TouchableOpacity>
      )}

      <View style={{ margin: px(16), gap: px(8) }}>
        <OLText size={14} style={{ color: COLORS.GRAY }}>
          {t(
            'You can turn notifications off for a single runner when editing them.',
          )}
        </OLText>
        {!isPlus && (
          <OLText size={14} style={{ color: COLORS.GRAY }}>
            {t(
              'Free: finish notifications for you and one runner you follow. LiveOL+: every notification, for every runner you follow.',
            )}
          </OLText>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    marginHorizontal: px(8),
    marginTop: px(16),
    marginBottom: px(8),
  },
  item: {
    paddingVertical: px(12),
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: px(16),
    borderBottomColor: COLORS.BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: px(12),
  },
  label: {
    flex: 1,
  },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(4),
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(12),
    margin: px(8),
    padding: px(12),
    borderRadius: 4,
    backgroundColor: COLORS.MAIN,
  },
});
