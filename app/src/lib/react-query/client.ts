import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

// React Native has no window focus events, so tell React Query when the app
// comes back to the foreground. Stale queries then refetch on resume.
focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active');
  });

  return () => subscription.remove();
});

export const queryClient = new QueryClient();
