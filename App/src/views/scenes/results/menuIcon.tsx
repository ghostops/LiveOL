import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { HIT_SLOP, px } from '~/util/const';
import { OLIcon } from '~/views/components/icon';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { useIap } from '~/hooks/useIap';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useFollowingStore } from '~/store/following';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';
import { useResultSearchStore } from '~/store/resultSearch';

export const ResultMenuIcon: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();
  const followClass = useFollowingStore(state => state.follow);
  const openSheet = useFollowBottomSheetStore(state => state.open);
  const {
    params: { className, competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();
  const setSearchTerm = useResultSearchStore(state => state.setSearchTerm);

  const onPress = () => {
    const options = [
      t('result.searchRunner.title'),
      t('follow.openFollowing'),
      t('result.followClass'),
      t('info.update.hasUpdate.cancel'),
    ];

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      selectedIndex => {
        if (typeof selectedIndex !== 'number') {
          return;
        }

        switch (selectedIndex) {
          case 2:
            if (!plusActive) {
              navigate('Plus', { feature: 'followClass' });
              break;
            }

            followClass({
              id: `${competitionId}:${className}`,
              name: className,
              type: 'class',
            });
            openSheet();

            break;

          case 1:
            if (!plusActive) {
              navigate('Plus', { feature: 'followClass' });
              break;
            }
            openSheet();
            break;
          case 0:
            Alert.prompt(
              t('result.searchRunner.title'),
              t('result.searchRunner.text'),
              text => {
                setSearchTerm(text);
              },
            );
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
