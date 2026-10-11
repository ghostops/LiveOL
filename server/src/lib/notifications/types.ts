export const NOTIFICATION_EVENTS = [
  'start',
  'split',
  'finish',
  'placeChange',
  'status',
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export type QuietHours = {
  /** HH:mm */
  from: string;
  /** HH:mm */
  to: string;
  /** IANA time zone, e.g. Europe/Stockholm */
  timezone: string;
};

export type NotificationPrefs = {
  enabled: boolean;
  events: Record<NotificationEvent, boolean>;
  quietHours: QuietHours | null;
};

export const PERMISSION_STATUSES = [
  'authorized',
  'provisional',
  'denied',
  'not_determined',
] as const;

export type PermissionStatus = (typeof PERMISSION_STATUSES)[number];
