import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { OLListItem } from '../list/item';
import { useTheme } from '~/hooks/useTheme';
import { Swipeable } from 'react-native-gesture-handler';
import { ActivityIndicator, Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';
import type { OLTrackingData } from './followSheet';
import { $api } from '~/lib/react-query/api';
import { queryClient } from '~/lib/react-query/client';

type Props = { item: OLTrackingData; onPress: (item: OLTrackingData) => void };

export const OLTrackingItem: React.FC<Props> = ({ item, onPress }) => {
  const { px } = useTheme();
  const { t } = useTranslation();
  const { mutateAsync: removeTrack, isPending } = $api.useMutation(
    'delete',
    '/v1/track/{id}',
    {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['get', '/v1/track'] });
      },
    },
  );

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
            flexDirection: 'row',
            gap: px(8),
          }}
          onPress={() => {
            removeTrack({ params: { path: { id: item.id } } });
          }}
          disabled={isPending}
        >
          {isPending && <ActivityIndicator size="small" color="white" />}
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
        onPress={() => onPress(item)}
      >
        <OLText size={16} style={{ marginBottom: px(4) }}>
          {item.runnerName}
        </OLText>
        <OLText size={12} numberOfLines={1}>
          {item.runnerClubs.join(', ')}
        </OLText>
        <OLText size={12} numberOfLines={1}>
          {item.runnerClasses.join(', ')}
        </OLText>
      </OLListItem>
    </Swipeable>
  );
};
