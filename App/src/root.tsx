import React, { useEffect } from 'react';
import Router from 'lib/nav/router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { promptStoreReview } from 'util/storeReview';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { client } from 'lib/graphql/client';
import { ApolloProvider } from '@apollo/client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import './lib/i18n';
import Bugsnag from '@bugsnag/react-native';
import { OLText } from 'views/components/text';
import { COLORS } from 'util/const';

!__DEV__ && Bugsnag.start();
const ErrorBoundary = !__DEV__
  ? Bugsnag.getPlugin('react').createErrorBoundary(React)
  : ({ children }: any) => <>{children}</>;

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
      <SafeAreaProvider>
        <ActionSheetProvider>
          <ApolloProvider client={client}>
            <View style={{ flex: 1 }}>
              <OLRotationWatcher>
                <Router />
              </OLRotationWatcher>
            </View>
          </ApolloProvider>
        </ActionSheetProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};
