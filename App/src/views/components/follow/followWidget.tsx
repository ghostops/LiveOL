import React from 'react';
import { View } from 'react-native';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { useIap } from 'lib/iap';
import { useFollowingStore } from 'store/following';

export const FollowWidget: React.FC = () => {
  const { t } = useTranslation();
  const { plusActive } = useIap();
  const { followingClasses, followingRunners, followingClubs } =
    useFollowingStore();

  if (!plusActive) {
    return null;
  }

  return (
    <View style={{ backgroundColor: 'red' }}>
      <OLText size={16}>{t('follow.title')}</OLText>
      {followingClasses.map(id => (
        <OLText size={12}>{id}</OLText>
      ))}
      {followingRunners.map(id => (
        <OLText size={12}>{id}</OLText>
      ))}
      {followingClubs.map(id => (
        <OLText size={12}>{id}</OLText>
      ))}
    </View>
  );
};
