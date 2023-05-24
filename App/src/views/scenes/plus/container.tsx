import { useIap } from 'lib/iap';
import React from 'react';
import { OLPlus as Component } from './component';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';

export const OLPlus: React.FC = () => {
  const { buy, displayPrice, restore, loading } = useIap();
  const route = useRoute<RouteProp<RootStack, 'Plus'>>();

  return (
    <Component
      feature={route?.params?.feature}
      price={displayPrice}
      onBuy={buy}
      onRestore={restore}
      loading={loading}
    />
  );
};
