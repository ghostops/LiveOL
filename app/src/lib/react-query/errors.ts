/** The API answers 403 { error: { message: 'plus_required' } } for LiveOL+ features. */
export const isPlusRequiredError = (error: unknown) =>
  (error as { error?: { message?: string } } | null)?.error?.message ===
  'plus_required';
