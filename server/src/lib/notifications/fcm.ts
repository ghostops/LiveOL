import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  getMessaging,
  Messaging,
  MulticastMessage,
} from 'firebase-admin/messaging';
import logger from 'lib/logger';

let messaging: Messaging | null | undefined;

/**
 * FIREBASE_SERVICE_ACCOUNT holds the service account JSON, either raw or
 * base64 encoded. Without it pushes are logged and skipped (local dev).
 */
const getFcm = (): Messaging | null => {
  if (messaging !== undefined) return messaging;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    logger.warn('Push: FIREBASE_SERVICE_ACCOUNT not set, pushes are disabled');
    messaging = null;
    return messaging;
  }

  try {
    const json = raw.trim().startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8');
    const app =
      getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(json)) });
    messaging = getMessaging(app);
  } catch (error) {
    logger.error(`Push: failed to initialise Firebase: ${error}`);
    messaging = null;
  }
  return messaging;
};

const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/** Sends one message to many tokens. Returns the tokens FCM says are dead. */
export const sendToTokens = async (
  tokens: string[],
  message: Omit<MulticastMessage, 'tokens'>,
): Promise<{ sent: number; deadTokens: string[] }> => {
  const fcm = getFcm();
  if (!fcm || tokens.length === 0) {
    if (!fcm) logger.debug({ message }, 'Push (not sent, FCM disabled)');
    return { sent: 0, deadTokens: [] };
  }

  const response = await fcm.sendEachForMulticast({ ...message, tokens });
  const deadTokens: string[] = [];
  response.responses.forEach((r, i) => {
    if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) {
      deadTokens.push(tokens[i]!);
    } else if (!r.success) {
      logger.warn(`Push: send failed: ${r.error?.code} ${r.error?.message}`);
    }
  });

  return { sent: response.successCount, deadTokens };
};
