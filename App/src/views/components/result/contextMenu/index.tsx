import React from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useIap } from 'lib/iap';
import { useOLNavigation } from 'hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';
import { OlResult } from 'lib/graphql/generated/types';
import { useFollowingStore } from 'store/following';

type Props = {
  result: OlResult;
  children: React.ReactNode;
};

export const OLRunnerContextMenu: React.FC<Props> = ({ children, result }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();
  const followRunner = useFollowingStore(state => state.followRunner);

  const onPress = () => {
    const options = [
      t('result.followRunner'),
      t('result.goToClub'),
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
            if (!plusActive) {
              navigate('Plus');
              break;
            }

            followRunner(result.id);
            navigate('Follow');
            break;
          case 1:
            navigate('Club', {
              competitionId,
              clubName: result.club,
              title: result.club,
            });
            break;
        }
      },
    );
  };

  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
};
