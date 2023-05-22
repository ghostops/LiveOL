import React from 'react';
import { OLFollow as Component } from './component';
import { useFollowingStore } from 'store/following';

export const OLFollow: React.FC = () => {
  const { followingRunners, followingClasses, followingClubs } =
    useFollowingStore();

  return (
    <Component
      runners={followingRunners}
      classes={followingClasses}
      clubs={followingClubs}
    />
  );
};
