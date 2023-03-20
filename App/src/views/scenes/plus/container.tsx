import { useIap } from 'lib/iap';
import React from 'react';
import { OLPlus as Component } from './component';

export const OLPlus: React.FC = () => {
  const { buy, displayPrice, restore, loading } = useIap();

  return (
    <Component
      price={displayPrice}
      onBuy={buy}
      onRestore={restore}
      loading={loading}
    />
  );
};
