import React from 'react';
import { TouchableOpacity } from 'react-native';
import { HIT_SLOP, px } from 'util/const';
import { OLIcon } from 'views/components/icon';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { useIap } from 'lib/iap';
import { useOLNavigation } from 'hooks/useNavigation';
import { useFollowingStore } from 'store/following';
import { RootStack } from 'lib/nav/router';
import { RouteProp, useRoute } from '@react-navigation/native';

export const ClubMenuIcon: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();
  const followClub = useFollowingStore(state => state.follow);
  const {
    params: { clubName, competitionId },
  } = useRoute<RouteProp<RootStack, 'Club'>>();

  const onPress = () => {
    const options = [t('result.followClub'), t('info.update.hasUpdate.cancel')];

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            if (!plusActive) {
              navigate('Plus');
              break;
            }

            followClub({
              id: `${competitionId}:${clubName}`,
              name: clubName,
              type: 'club',
            });
            navigate('Follow');

            break;
        }
      },
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginRight: px(12) }}
      hitSlop={HIT_SLOP}
    >
      <OLIcon name="ellipsis-vertical" size={24} color="white" />
    </TouchableOpacity>
  );
};
