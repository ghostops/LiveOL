import { useIap } from 'hooks/useIap';
import React from 'react';
import { OLPlus as Component } from './component';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';
import { useOLNavigation } from 'hooks/useNavigation';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const OLPlus: React.FC = () => {
  const { buy, displayPrice, restore, loading } = useIap();
  const route = useRoute<RouteProp<RootStack, 'Plus'>>();
  const { goBack } = useOLNavigation();
  const { t } = useTranslation();

  return (
    <Component
      feature={route?.params?.feature}
      price={displayPrice || 'N/A'}
      onBuy={async () => {
        try {
          await buy();
          goBack();
          Alert.alert(t('plus.buy.success'));
        } catch (e: any) {
          if (e?.userCancelled) {
            return;
          }

          Alert.alert(t('plus.buy.error'));
        }
      }}
      onRestore={restore}
      loading={loading}
    />
  );
};
