import React, { useEffect } from 'react';
import Router from '~/lib/nav/router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { promptStoreReview } from '~/util/storeReview';
import { OLRotationWatcher } from '~/views/components/watcher/rotation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import Bugsnag from '@bugsnag/react-native';
import { OLText } from '~/views/components/text';
import { COLORS } from '~/util/const';
import { queryClient } from '~/lib/react-query/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import '~/lib/i18n';
import { useDeviceIdStore } from './store/deviceId';
import { getUniqueId } from 'react-native-device-info';
import {
  TelemetryDeckProvider,
  createTelemetryDeck,
} from '@typedigital/telemetrydeck-react';

const td = createTelemetryDeck({
  appID: '37598E68-7474-4EA1-A1AE-353B04D4ADFB',
  clientUser: 'anonymous',
});

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
  const setDeviceId = useDeviceIdStore(state => state.setDeviceId);

  useEffect(() => {
    setTimeout(() => {
      !__DEV__ && promptStoreReview();
    }, 3000);
  }, []);

  useEffect(() => {
    async function initializeDeviceId() {
      const id = await getUniqueId();
      setDeviceId(id);
      console.log('Device ID initialized:', id);
    }

    initializeDeviceId();
  }, [setDeviceId]);

  return (
    <ErrorBoundary FallbackComponent={ErrorView}>
      <TelemetryDeckProvider telemetryDeck={td}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ActionSheetProvider>
              <QueryClientProvider client={queryClient}>
                <View style={{ flex: 1 }}>
                  <BottomSheetModalProvider>
                    <OLRotationWatcher>
                      <Router />
                    </OLRotationWatcher>
                  </BottomSheetModalProvider>
                </View>
              </QueryClientProvider>
            </ActionSheetProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </TelemetryDeckProvider>
    </ErrorBoundary>
  );
};
