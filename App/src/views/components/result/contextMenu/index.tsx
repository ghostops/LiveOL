import React from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useIap } from '~/hooks/useIap';
import { useOLNavigation } from '~/hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { useFollowingStore } from '~/store/following';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';

type Props = {
  result: TRPCQueryOutput['getResults']['results'][0];
  children: React.ReactNode;
  club: boolean;
};

export const OLRunnerContextMenu: React.FC<Props> = ({
  children,
  result,
  club,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive, presentPaywall } = useIap();
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();
  const followRunner = useFollowingStore(state => state.follow);
  const openSheet = useFollowBottomSheetStore(state => state.open);

  const onPress = () => {
    const options = [
      t('result.followRunner'),
      club ? t('result.goToClass') : t('result.goToClub'),
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
          case 0:
            if (!plusActive) {
              presentPaywall();
              break;
            }

            followRunner({
              id: result.id,
              name: result.name,
              type: 'runner',
              className: result.class!,
              competitionId,
            });
            openSheet();
            break;
          case 1:
            if (club) {
              navigate('Results', {
                competitionId,
                className: result.class!,
              });
              break;
            }

            navigate('Club', {
              competitionId,
              clubName: result.club!,
              title: result.club!,
            });
            break;
        }
      },
    );
  };

  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
};
