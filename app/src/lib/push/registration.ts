import { Platform } from 'react-native';
import { $fetch } from '~/lib/react-query/api';
import { usePushStore } from '~/store/push';
import {
  canReceivePush,
  getPushPermissionStatus,
  getPushToken,
  isPushAvailable,
  PushPermissionStatus,
} from '.';

const platform = Platform.OS === 'ios' ? 'ios' : 'android';

/**
 * Reads the OS permission and tells the server about this device's token and
 * permission. Safe to call often: on start, on foreground, on token refresh.
 */
export const syncPushRegistration = async (
  uid: string,
  knownStatus?: PushPermissionStatus,
): Promise<PushPermissionStatus> => {
  const store = usePushStore.getState();
  if (!uid || !isPushAvailable()) {
    return store.permissionStatus;
  }

  let status = knownStatus ?? (await getPushPermissionStatus());
  // Android can't report "denied" without asking again; remember our last answer
  if (
    Platform.OS === 'android' &&
    status === 'not_determined' &&
    store.permissionStatus === 'denied'
  ) {
    status = 'denied';
  }
  store.setPermissionStatus(status);

  const token = canReceivePush(status)
    ? await getPushToken()
    : store.registeredToken;
  if (!token) {
    return status;
  }

  try {
    const { error } = await $fetch.POST('/v2/notifications/push/register', {
      body: { uid, token, platform, permissionStatus: status },
    });
    if (!error) {
      store.setRegisteredToken(token);
    }
  } catch (error) {
    __DEV__ && console.warn('[Push] Failed to register token', error);
  }

  return status;
};
