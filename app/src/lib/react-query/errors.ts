/** The API answers 403 { error: { message: 'plus_required' } } for LiveOL+ features. */
export const isPlusRequiredError = (error: unknown) =>
  (error as { error?: { message?: string } } | null)?.error?.message ===
  'plus_required';

/** The API answers 429 { error: { message: 'test_push_cooldown' } } between test pushes. */
export const isTestPushCooldownError = (error: unknown) =>
  (error as { error?: { message?: string } } | null)?.error?.message ===
  'test_push_cooldown';
