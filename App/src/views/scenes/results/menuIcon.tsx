import React from 'react';
import { TouchableOpacity } from 'react-native';
import { HIT_SLOP, px } from 'util/const';
import { useAudioStore } from 'store/audio';
import { OLIcon } from 'views/components/icon';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { useIap } from 'lib/iap';
import { useOLNavigation } from 'hooks/useNavigation';
import { useFollowingStore } from 'store/following';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';

export const ResultMenuIcon: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { isMuted, setMuted } = useAudioStore();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();
  const followClass = useFollowingStore(state => state.followClass);
  const {
    params: { className, competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  const onPress = () => {
    const options = [
      // TODO: This doesnt work on Android?
      isMuted ? t('result.unmute') : t('result.mute'),
      t('result.followClass'),
      t('info.update.hasUpdate.cancel'),
    ];

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            setMuted(!isMuted);
            break;
          case 1:
            if (!plusActive) {
              navigate('Plus');
              break;
            }

            followClass(`${competitionId}:${className}`);
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
