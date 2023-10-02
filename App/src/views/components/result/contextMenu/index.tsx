import React from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useIap } from 'hooks/useIap';
import { useOLNavigation } from 'hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';
import { OlResult } from 'lib/graphql/generated/types';
import { useFollowingStore } from 'store/following';

type Props = {
  result: OlResult;
  children: React.ReactNode;
  club?: boolean;
};

export const OLRunnerContextMenu: React.FC<Props> = ({
  children,
  result,
  club,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();
  const followRunner = useFollowingStore(state => state.follow);

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
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            if (!plusActive) {
              navigate('Plus', { feature: 'followRunner' });
              break;
            }

            followRunner({
              id: result.id,
              name: result.name,
              type: 'runner',
              className: result.class,
              competitionId,
            });
            navigate('Follow');
            break;
          case 1:
            if (club) {
              navigate('Results', {
                competitionId,
                className: result.class,
              });
              break;
            }

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
