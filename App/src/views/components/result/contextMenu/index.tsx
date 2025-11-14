import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useIap } from '~/hooks/useIap';
import { useOLNavigation } from '~/hooks/useNavigation';
import { paths } from '~/lib/react-query/schema';

type Props = {
  result: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
  children: React.ReactNode;
};

export const OLRunnerContextMenu: React.FC<Props> = ({
  children,
  result: { name, className, organization },
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive, presentPaywall } = useIap();
  const navigation = useOLNavigation();

  const onPress = () => {
    const options = [
      t('result.followRunner'),
      t('info.update.hasUpdate.cancel'),
    ].filter(Boolean) as string[];

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

            navigation.navigate('EditTrackRunner', {
              mode: 'create',
              runner: {
                name,
                classes: className ? [className] : [],
                clubs: organization ? [organization] : [],
              },
            });
            break;
          default:
            break;
        }
      },
    );
  };

  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
};
