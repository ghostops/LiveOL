import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import Router from 'lib/nav/router';
import { promptStoreReview } from 'util/storeReview';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { client } from 'lib/graphql/client';
import { ApolloProvider } from '@apollo/client';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './lib/i18n';

export default () => {
  useEffect(() => {
    setTimeout(() => {
      !__DEV__ && promptStoreReview();
    }, 3000);
  }, []);

  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        <View style={{ flex: 1 }}>
          <OLRotationWatcher>
            <Router />
          </OLRotationWatcher>
        </View>
        <Toast />
      </ApolloProvider>
    </SafeAreaProvider>
  );
};
