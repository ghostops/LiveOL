import React from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useIap } from 'lib/iap';
import { useOLNavigation } from 'hooks/useNavigation';

type Props = {
  children: React.ReactNode;
};

export const OLFollowMenu: React.FC<Props> = ({ children }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive } = useIap();
  const { navigate } = useOLNavigation();

  const onPress = () => {
    const options = [
      t('result.followRunner'),
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

            break;
        }
      },
    );
  };

  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
};
