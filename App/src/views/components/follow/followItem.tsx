import React from 'react';
import { Alert } from 'react-native';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { FollowingData, useFollowingStore } from '~/store/following';
import { OLListItem } from '../list/item';
import { useTheme } from '~/hooks/useTheme';

export const OLFollowItem: React.FC<{ item: FollowingData }> = ({ item }) => {
  const { px } = useTheme();
  // const { name } = useRoute<RouteProp<RootStack>>();
  const { unFollow } = useFollowingStore();
  const { t } = useTranslation();

  const goToFollow = () => {
    // if (name === 'Follow') {
    //   // pop();
    // }

    if (item.type === 'runner') {
      // navigate('Results', {
      //   competitionId: Number(item.competitionId),
      //   className: item.className,
      //   runnerId: item.id,
      // });
    }

    if (item.type === 'club') {
      const [competitionId, clubName] = item.id.split(':');

      console.log(competitionId, clubName);
      // navigate('Club', {
      //   competitionId: Number(competitionId),
      //   clubName,
      //   title: clubName,
      // });
    }

    if (item.type === 'class') {
      const [competitionId, className] = item.id.split(':');

      console.log(competitionId, className);
      // navigate('Results', {
      //   competitionId: Number(competitionId),
      //   className,
      // });
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
