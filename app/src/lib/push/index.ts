import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  hasPermission,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export type PushPermissionStatus =
  | 'authorized'
  | 'provisional'
  | 'denied'
  | 'not_determined';

type Messaging = ReturnType<typeof getMessaging>;

/**
 * Firebase is only configured once GoogleService-Info.plist /
 * google-services.json are added. Until then push is unavailable, never a crash.
 */
export const getMessagingSafe = (): Messaging | null => {
  try {
    return getMessaging(getApp());
  } catch {
    return null;
  }
};

export const isPushAvailable = () => getMessagingSafe() !== null;

// FirebaseMessagingTypes.AuthorizationStatus
const fromIosStatus = (status: number): PushPermissionStatus => {
  switch (status) {
    case 1:
      return 'authorized';
    case 2:
    case 3:
      return 'provisional';
    case 0:
      return 'denied';
    default:
      return 'not_determined';
  }
};

const needsAndroidRuntimePermission = () =>
  Platform.OS === 'android' && Number(Platform.Version) >= 33;

export const getPushPermissionStatus =
  async (): Promise<PushPermissionStatus> => {
    if (Platform.OS === 'android') {
      if (!needsAndroidRuntimePermission()) {
        return 'authorized';
      }
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      // Android can't tell "never asked" from "denied" without asking
      return granted ? 'authorized' : 'not_determined';
    }

    const messaging = getMessagingSafe();
    if (!messaging) {
      return 'not_determined';
    }
    return fromIosStatus(await hasPermission(messaging));
  };

export const requestPushPermission =
  async (): Promise<PushPermissionStatus> => {
    if (Platform.OS === 'android') {
      if (!needsAndroidRuntimePermission()) {
        return 'authorized';
      }
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED
        ? 'authorized'
        : 'denied';
    }

    const messaging = getMessagingSafe();
    if (!messaging) {
      return 'not_determined';
    }
    return fromIosStatus(await requestPermission(messaging));
  };

export const getPushToken = async (): Promise<string | null> => {
  const messaging = getMessagingSafe();
  if (!messaging) {
    return null;
  }
  try {
    return await getToken(messaging);
  } catch (error) {
    __DEV__ && console.warn('[Push] Failed to get token', error);
    return null;
  }
};

export const canReceivePush = (status: PushPermissionStatus) =>
  status === 'authorized' || status === 'provisional';
