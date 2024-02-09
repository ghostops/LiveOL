import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { FollowingData, useFollowingStore } from '~/store/following';
import { OLListItem } from '../list/item';
import { useTheme } from '~/hooks/useTheme';
import { Swipeable } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { trpc } from '~/lib/trpc/client';

type Props = { item: FollowingData; onPress: () => void };

const useSubtitle = (data: FollowingData) => {
  const [competitionId] = data.id.split(':');
  const id = Number(
    data.type === 'runner' ? data.competitionId : competitionId,
  );

  const competition = trpc.getCompetition.useQuery(
    {
      competitionId: id,
    },
    { enabled: !!id },
  );

  if (data.type === 'runner') {
    if (competition.data?.competition.name) {
      return `${competition.data?.competition.name}: ${data.className}`;
    }

    return data.className;
  }

  return competition.data?.competition.name;
};

export const OLFollowItem: React.FC<Props> = ({ item, onPress }) => {
  const { px } = useTheme();
  const { unFollow } = useFollowingStore();
  const { t } = useTranslation();
  const subtitle = useSubtitle(item);

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
          onPress={() => unFollow(item.id)}
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
        <OLText size={16}>{item.name}</OLText>
        {subtitle && (
          <OLText size={12} style={{ marginTop: px(4) }}>
            {subtitle}
          </OLText>
        )}
      </OLListItem>
    </Swipeable>
  );
};
