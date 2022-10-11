import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import Router from 'lib/nav/router';
import { px } from 'util/const';
import { promptStoreReview } from 'util/storeReview';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { client } from 'lib/graphql/client';
import { ApolloProvider } from '@apollo/client';
import { ActivityIndicator, Image, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './lib/i18n';

export default () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      !__DEV__ && promptStoreReview();
    }, 3000);

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <Image
          source={require('../assets/images/splash.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            height: '100%',
            width: '100%',
          }}
          resizeMode="cover"
        />
        <ActivityIndicator
          color="white"
          style={{ marginBottom: px(65) }}
          size="large"
        />
      </View>
    );
  }

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
