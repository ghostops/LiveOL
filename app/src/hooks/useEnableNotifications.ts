import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';
import {
  canReceivePush,
  getPushPermissionStatus,
  isPushAvailable,
  requestPushPermission,
} from '~/lib/push';
import { syncPushRegistration } from '~/lib/push/registration';
import { usePushStore } from '~/store/push';
import { useUserIdStore } from '~/store/userId';
import { useNotificationSettings } from './useNotificationSettings';

const confirm = (title: string, message: string, ok: string, cancel: string) =>
  new Promise<boolean>(resolve =>
    Alert.alert(title, message, [
      { text: cancel, style: 'cancel', onPress: () => resolve(false) },
      { text: ok, onPress: () => resolve(true) },
    ]),
  );

/**
 * Turns notifications on: explains why first, then asks the OS once. A denied
 * permission can only be changed in system settings, so we send users there.
 */
export const useEnableNotifications = () => {
  const { t } = useTranslation();
  const userId = useUserIdStore(state => state.userId);
  const storedStatus = usePushStore(state => state.permissionStatus);
  const { update } = useNotificationSettings();

  const openSystemSettings = useCallback(() => Linking.openSettings(), []);

  const enable = useCallback(
    async ({ reason }: { reason?: string } = {}): Promise<boolean> => {
      if (!isPushAvailable()) {
        Alert.alert(t('Notifications are not available in this version'));
        return false;
      }

      let status = await getPushPermissionStatus();
      if (status === 'not_determined' && storedStatus === 'denied') {
        status = 'denied';
      }

      if (status === 'denied') {
        const open = await confirm(
          t('Notifications are turned off'),
          t('Allow notifications for LiveOL in your system settings.'),
          t('Open settings'),
          t('Cancel'),
        );
        if (open) {
          openSystemSettings();
        }
        return false;
      }

      if (status === 'not_determined') {
        const proceed = await confirm(
          t('Get notified'),
          reason ??
            t(
              'LiveOL can send you a notification when a runner you follow finishes.',
            ),
          t('Continue'),
          t('Not now'),
        );
        if (!proceed) {
          return false;
        }
        status = await requestPushPermission();
      }

      await syncPushRegistration(userId, status);
      if (!canReceivePush(status)) {
        return false;
      }

      await update({ enabled: true });
      return true;
    },
    [openSystemSettings, storedStatus, t, update, userId],
  );

  return { enable, openSystemSettings };
};
