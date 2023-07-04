import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { useIap } from 'hooks/useIap';
import { useFollowingStore } from 'store/following';
import { useTheme } from 'hooks/useTheme';
import { useOLNavigation } from 'hooks/useNavigation';
import { OLFollowItem } from './followItem';
import { OLSafeAreaView } from '../safeArea';

export const FollowWidget: React.FC = () => {
  const { px, colors } = useTheme();
  const { t } = useTranslation();
  const { navigate } = useOLNavigation();
  const { plusActive } = useIap();
  const { following } = useFollowingStore();

  if (!plusActive || !following.length) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => navigate('Follow')}
      activeOpacity={1}
      style={{
        paddingTop: px(16),
        backgroundColor: colors.MAIN,
      }}
    >
      <OLText
        size={16}
        style={{ textAlign: 'center', paddingBottom: px(16), color: 'white' }}
        bold
        uppercase
      >
        {t('follow.title')}
      </OLText>

      <OLSafeAreaView>
        <View style={{ backgroundColor: 'white' }}>
          {following.map(follow => (
            <OLFollowItem key={follow.id} item={follow} />
          ))}
        </View>
      </OLSafeAreaView>
    </TouchableOpacity>
  );
};
