import { useEffect } from 'react';
import { AppState, Platform, ToastAndroid } from 'react-native';
import {
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { getNavigationRef } from '~/hooks/useNavigation';
import { getMessagingSafe } from '~/lib/push';
import { syncPushRegistration } from '~/lib/push/registration';
import { queryClient } from '~/lib/react-query/client';
import { useUserIdStore } from '~/store/userId';

type RemoteMessage = Parameters<Parameters<typeof onMessage>[1]>[0];

const NAV_READY_RETRIES = 20;

/**
 * Keeps this device's push token registered and routes notification taps to
 * the right results screen.
 */
export const PushRegistration = () => {
  const userId = useUserIdStore(state => state.userId);

  useEffect(() => {
    if (!userId) {
      return;
    }

    syncPushRegistration(userId);

    // Users can change notification permission in system settings at any time
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') {
        syncPushRegistration(userId);
      }
    });

    const messaging = getMessagingSafe();
    const unsubscribeToken = messaging
      ? onTokenRefresh(messaging, () => syncPushRegistration(userId))
      : undefined;

    return () => {
      appState.remove();
      unsubscribeToken?.();
    };
  }, [userId]);

  useEffect(() => {
    const messaging = getMessagingSafe();
    if (!messaging) {
      return;
    }

    const openResults = (message: RemoteMessage | null, attempt = 0) => {
      const data = message?.data;
      if (!data) {
        return;
      }

      const navRef = getNavigationRef();
      if (!navRef?.isReady()) {
        // Cold start: the navigator mounts after the notification is read
        if (attempt < NAV_READY_RETRIES) {
          setTimeout(() => openResults(message, attempt + 1), 250);
        }
        return;
      }

      const { olCompetitionId, liveClassId, trackingId } = data;
      if (
        typeof olCompetitionId === 'string' &&
        olCompetitionId &&
        typeof liveClassId === 'string'
      ) {
        navRef.navigate('LiveResults', { olCompetitionId, liveClassId });
      } else if (trackingId) {
        navRef.navigate('TrackingResults', {
          trackingId: Number(trackingId),
          title: message?.notification?.title ?? '',
        });
      }
    };

    getInitialNotification(messaging).then(message => openResults(message));
    const unsubscribeOpened = onNotificationOpenedApp(messaging, message =>
      openResults(message),
    );

    // iOS shows foreground notifications itself (see firebase.json)
    const unsubscribeMessage = onMessage(messaging, message => {
      queryClient.invalidateQueries({
        predicate: query =>
          typeof query.queryKey[1] === 'string' &&
          query.queryKey[1].startsWith('/v2/results/'),
      });

      const { title, body } = message.notification ?? {};
      if (Platform.OS === 'android' && title) {
        ToastAndroid.show(
          body ? `${title}: ${body}` : title,
          ToastAndroid.LONG,
        );
      }
    });

    return () => {
      unsubscribeOpened();
      unsubscribeMessage();
    };
  }, []);

  return null;
};
