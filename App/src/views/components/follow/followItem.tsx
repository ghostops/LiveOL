import React from 'react';
import { Alert } from 'react-native';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { FollowingData, useFollowingStore } from 'store/following';
import { OLListItem } from '../list/item';
import { useTheme } from 'hooks/useTheme';
import { useOLNavigation } from 'hooks/useNavigation';

export const FollowItem: React.FC<{ item: FollowingData }> = ({ item }) => {
  const { px } = useTheme();
  const { navigate } = useOLNavigation();
  const { unFollow } = useFollowingStore();
  const { t } = useTranslation();

  const goToFollow = () => {
    if (item.type === 'runner') {
      const [competitionId, className] = item.id.split(':');

      navigate('Results', {
        competitionId: Number(competitionId),
        className,
        runnerId: item.id,
      });
    }

    if (item.type === 'club') {
      const [competitionId, clubName] = item.id.split(':');

      navigate('Club', {
        competitionId: Number(competitionId),
        clubName,
        title: clubName,
      });
    }

    if (item.type === 'class') {
      const [competitionId, className] = item.id.split(':');

      navigate('Results', {
        competitionId: Number(competitionId),
        className,
      });
    }
  };

  return (
    <OLListItem
      style={{
        marginLeft: 0,
        paddingHorizontal: px(16),
        paddingVertical: px(12),
        width: '100%',
      }}
      onPress={goToFollow}
      onLongPress={() =>
        Alert.alert(t('follow.unfollow.title'), undefined, [
          {
            onPress: () => unFollow(item.id),
            text: t('follow.unfollow.cta'),
            style: 'destructive',
          },
          { text: t('info.update.hasUpdate.cancel'), style: 'cancel' },
        ])
      }
    >
      <OLText size={16}>{item.name}</OLText>
    </OLListItem>
  );
};
