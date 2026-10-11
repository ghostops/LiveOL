import { NativeModules, Platform, ToastAndroid } from 'react-native';

type PushData = Record<string, string>;

type ForegroundNotificationModule = {
  show(
    title: string,
    body: string | null,
    channelId: string,
    tag: string | null,
    data: PushData,
  ): void;
};

/**
 * Experimental native module (ForegroundNotificationModule.kt). If it causes
 * problems, delete the Kotlin file and its package registration; this falls
 * back to a toast.
 */
const native: ForegroundNotificationModule | undefined =
  NativeModules.LiveOLForegroundNotification;

/** Event types with a notification channel (created in MainApplication.kt). */
const CHANNEL_TYPES = ['finish', 'split', 'start', 'status', 'placeChange'];

/** Taps on foreground notifications open the app with this URI prefix. */
const PUSH_LINK_PREFIX = 'liveol-push://open';

export const toPushData = (data: Record<string, unknown> | undefined) =>
  Object.fromEntries(
    Object.entries(data ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

/** Android doesn't display FCM notifications in the foreground; iOS does (firebase.json). */
export const showForegroundNotification = (
  title: string | undefined,
  body: string | undefined,
  data: PushData,
) => {
  if (Platform.OS !== 'android' || !title) {
    return;
  }

  if (!native?.show) {
    ToastAndroid.show(body ? `${title}: ${body}` : title, ToastAndroid.LONG);
    return;
  }

  // Channel ids match androidChannelId() in server/src/jobs/push/send-push.ts.
  // Android silently drops notifications posted to a channel that doesn't exist.
  const channelId =
    data.type && CHANNEL_TYPES.includes(data.type)
      ? `results_${data.type}`
      : 'results_finish';
  native.show(title, body ?? null, channelId, data.liveResultId ?? null, data);
};

export const parsePushLink = (url: string | null): PushData | null => {
  if (!url?.startsWith(PUSH_LINK_PREFIX)) {
    return null;
  }
  const query = url.slice(PUSH_LINK_PREFIX.length).replace(/^\/?\?/, '');
  const data: PushData = {};
  for (const pair of query.split('&')) {
    if (!pair) {
      continue;
    }
    const [key, value = ''] = pair.split('=');
    data[decodeURIComponent(key!)] = decodeURIComponent(
      value.replace(/\+/g, ' '),
    );
  }
  return data;
};
