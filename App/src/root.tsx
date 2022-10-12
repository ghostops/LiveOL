import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import Router from 'lib/nav/router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { promptStoreReview } from 'util/storeReview';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { OLCodePush } from 'views/components/codepush';
import { client } from 'lib/graphql/client';
import { ApolloProvider } from '@apollo/client';
import './lib/i18n';

export default () => {
  useEffect(() => {
    setTimeout(() => {
      !__DEV__ && promptStoreReview();
    }, 3000);
  }, []);

  return (
    <OLCodePush>
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
    </OLCodePush>
  );
};
