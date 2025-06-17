import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { OLListItem } from '../list/item';
import { useTheme } from '~/hooks/useTheme';
import { Swipeable } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';
import type { OLTrackingData } from './followSheet';

type Props = { item: OLTrackingData; onPress: () => void };

export const OLTrackingItem: React.FC<Props> = ({ item, onPress }) => {
  const { px } = useTheme();
  const { t } = useTranslation();

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<any>,
    dragAnimatedValue: Animated.AnimatedInterpolation<any>,
  ) => {
    const opacity = dragAnimatedValue.interpolate({
      inputRange: [-125, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[{ opacity }]}>
        <TouchableOpacity
          style={{
            backgroundColor: '#e74c3c',
            height: '100%',
            width: 125,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {}}
        >
          <OLText size={16} style={{ color: 'white' }}>
            {t('follow.unfollow.cta')}
          </OLText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <OLListItem
        style={{
          marginLeft: 0,
          paddingHorizontal: px(16),
          paddingVertical: px(12),
          width: '100%',
        }}
        onPress={onPress}
      >
        <OLText size={16}>{item.runnerName}</OLText>
      </OLListItem>
    </Swipeable>
  );
};
