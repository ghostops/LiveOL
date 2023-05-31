import React from 'react';
import { OLFollow as Component } from './component';
import { useFollowingStore } from 'store/following';

export const OLFollow: React.FC = () => {
  const { following } = useFollowingStore();

  return <Component following={following} />;
};
