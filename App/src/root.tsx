import React, { useEffect } from 'react';
import Router from '~/lib/nav/router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { promptStoreReview } from '~/util/storeReview';
import { OLRotationWatcher } from '~/views/components/watcher/rotation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import '~/lib/i18n';
import Bugsnag from '@bugsnag/react-native';
import { OLText } from '~/views/components/text';
import { COLORS } from '~/util/const';
import { trpc, trpcClient } from '~/lib/trpc/client';
import { queryClient } from '~/lib/react-query/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const fallbackErrorBoundary = ({ children }: any) => <>{children}</>;
let ErrorBoundary: any;

try {
  !__DEV__ && Bugsnag.start();
  ErrorBoundary = !__DEV__
    ? Bugsnag.getPlugin('react').createErrorBoundary(React)
    : fallbackErrorBoundary;
} catch (error) {
  console.warn('BUGSNAG FAILURE');
  console.warn(error);
  ErrorBoundary = fallbackErrorBoundary;
}
const ErrorView = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.DARK,
      paddingHorizontal: 16,
    }}
  >
    <OLText
      size={26}
      style={{ textAlign: 'center', marginBottom: 16, color: 'white' }}
    >
      Something went wrong 😢
    </OLText>
    <OLText size={20} style={{ textAlign: 'center', color: 'white' }}>
      Please restart the app, and reach out if it keeps happening.
    </OLText>
  </View>
);

export default () => {
  useEffect(() => {
    setTimeout(() => {
      !__DEV__ && promptStoreReview();
    }, 3000);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ActionSheetProvider>
            <trpc.Provider client={trpcClient()} queryClient={queryClient}>
              <QueryClientProvider client={queryClient}>
                <View style={{ flex: 1 }}>
                  <BottomSheetModalProvider>
                    <OLRotationWatcher>
                      <Router />
                    </OLRotationWatcher>
                  </BottomSheetModalProvider>
                </View>
              </QueryClientProvider>
            </trpc.Provider>
          </ActionSheetProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};
