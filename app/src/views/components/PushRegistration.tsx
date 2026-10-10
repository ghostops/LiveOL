import { useEffect } from 'react';
import { AppState, Linking } from 'react-native';
import {
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { getNavigationRef } from '~/hooks/useNavigation';
import { getMessagingSafe } from '~/lib/push';
import {
  parsePushLink,
  showForegroundNotification,
  toPushData,
} from '~/lib/push/foreground';
import { syncPushRegistration } from '~/lib/push/registration';
import { queryClient } from '~/lib/react-query/client';
import { useUserIdStore } from '~/store/userId';

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

    const openResults = (
      data: Record<string, string> | null,
      title = '',
      attempt = 0,
    ) => {
      if (!data) {
        return;
      }

      const navRef = getNavigationRef();
      if (!navRef?.isReady()) {
        // Cold start: the navigator mounts after the notification is read
        if (attempt < NAV_READY_RETRIES) {
          setTimeout(() => openResults(data, title, attempt + 1), 250);
        }
        return;
      }

      const { olCompetitionId, liveClassId, trackingId } = data;
      if (olCompetitionId && liveClassId) {
        navRef.navigate('LiveResults', { olCompetitionId, liveClassId });
      } else if (trackingId) {
        navRef.navigate('TrackingResults', {
          trackingId: Number(trackingId),
          title,
        });
      }
    };

    const openMessage = (
      message: {
        data?: Record<string, unknown>;
        notification?: { title?: string };
      } | null,
    ) =>
      message &&
      openResults(toPushData(message.data), message.notification?.title);

    getInitialNotification(messaging).then(openMessage);
    const unsubscribeOpened = onNotificationOpenedApp(messaging, openMessage);

    // Taps on Android foreground notifications (see lib/push/foreground.ts)
    Linking.getInitialURL().then(url => openResults(parsePushLink(url)));
    const linkSubscription = Linking.addEventListener('url', ({ url }) =>
      openResults(parsePushLink(url)),
    );

    const unsubscribeMessage = onMessage(messaging, message => {
      queryClient.invalidateQueries({
        predicate: query =>
          typeof query.queryKey[1] === 'string' &&
          query.queryKey[1].startsWith('/v2/results/'),
      });

      showForegroundNotification(
        message.notification?.title,
        message.notification?.body,
        toPushData(message.data),
      );
    });

    return () => {
      unsubscribeOpened();
      unsubscribeMessage();
      linkSubscription.remove();
    };
  }, []);

  return null;
};
