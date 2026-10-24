import { useEffect, useRef } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import {
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { getNavigationRef } from '~/hooks/useNavigation';
import { useNotificationSettings } from '~/hooks/useNotificationSettings';
import { getMessagingSafe, requestPushPermission } from '~/lib/push';
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
  const { settings } = useNotificationSettings();
  const prefsEnabled = settings?.prefs.enabled;
  const hasReprompted = useRef(false);

  // Prefs are stored per user and survive a reinstall, the OS permission
  // doesn't. The user already opted in, so ask the OS again right away.
  useEffect(() => {
    if (!userId || !prefsEnabled || hasReprompted.current) {
      return;
    }
    hasReprompted.current = true;

    (async () => {
      const status = await syncPushRegistration(userId);
      if (status === 'not_determined') {
        syncPushRegistration(userId, await requestPushPermission());
      }
    })();
  }, [prefsEnabled, userId]);

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

    // A tap can arrive both as an event and through getInitialNotification
    const openedMessageIds = new Set<string>();
    const openMessage = (
      message: {
        messageId?: string;
        data?: Record<string, unknown>;
        notification?: { title?: string };
      } | null,
    ) => {
      if (!message) {
        return;
      }
      if (message.messageId) {
        if (openedMessageIds.has(message.messageId)) {
          return;
        }
        openedMessageIds.add(message.messageId);
      }
      openResults(toPushData(message.data), message.notification?.title);
    };

    getInitialNotification(messaging).then(openMessage);
    const unsubscribeOpened = onNotificationOpenedApp(messaging, openMessage);

    // On iOS the opened event can get lost since the UIScene switch (#106).
    // RNFB keeps every tapped notification for getInitialNotification, so
    // read it again whenever the app comes back. The tap can be delivered just
    // after the app turns active, so check once more shortly after.
    const checkTapped = () =>
      getInitialNotification(messaging).then(openMessage);
    const appState =
      Platform.OS === 'ios'
        ? AppState.addEventListener('change', state => {
            if (state === 'active') {
              checkTapped();
              setTimeout(checkTapped, 1000);
            }
          })
        : undefined;

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
      appState?.remove();
      linkSubscription.remove();
    };
  }, []);

  return null;
};
