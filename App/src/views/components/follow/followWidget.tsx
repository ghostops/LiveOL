import React from 'react';
import { View } from 'react-native';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';

export const FollowWidget: React.FC = () => {
  const { t } = useTranslation();
  return (
    <View>
      <OLText size={16}>{t('follow.title')}</OLText>
    </View>
  );
};
