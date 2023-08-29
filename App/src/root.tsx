import React, { useEffect } from 'react';
import Router from 'lib/nav/router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { promptStoreReview } from 'util/storeReview';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { OLCodePush } from 'views/components/codepush';
import { client } from 'lib/graphql/client';
import { ApolloProvider } from '@apollo/client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import './lib/i18n';
import { OLRedeemModal } from 'views/components/redeem_modal';

export default () => {
  useEffect(() => {
    setTimeout(() => {
      !__DEV__ && promptStoreReview();
    }, 3000);
  }, []);

  return (
    <OLCodePush>
      <SafeAreaProvider>
        <ActionSheetProvider>
          <ApolloProvider client={client}>
            <View style={{ flex: 1 }}>
              <OLRotationWatcher>
                <Router />
                <OLRedeemModal />
              </OLRotationWatcher>
            </View>
          </ApolloProvider>
        </ActionSheetProvider>
      </SafeAreaProvider>
    </OLCodePush>
  );
};
