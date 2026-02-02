import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useIap } from '~/hooks/useIap';
import { useOLNavigation } from '~/hooks/useNavigation';
import { paths } from '~/lib/react-query/schema';

type Props = {
  result: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
  children: React.ReactNode;

  olCompetitionId?: string;
  olOrganizationId?: string;
  liveClassId?: string;
  canTrackRunner?: boolean;
  canGoToCompetition?: boolean;
};

export const OLRunnerContextMenu: React.FC<Props> = ({
  children,
  result: { name, organization },
  liveClassId,
  olCompetitionId,
  olOrganizationId,
  canTrackRunner = true,
  canGoToCompetition = false,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();
  const { plusActive, presentPaywall } = useIap();
  const navigation = useOLNavigation();

  const onPress = () => {
    const actions: Array<{
      id: string;
      label: string;
      handler: () => void;
    }> = [];

    if (canTrackRunner) {
      actions.push({
        id: 'follow',
        label: t('Follow runner'),
        handler: () => {
          if (!plusActive) {
            presentPaywall();
            return;
          }

          navigation.navigate('EditTrackRunner', {
            mode: 'create',
            runner: {
              name,
              clubs: organization ? [organization] : [],
            },
          });
        },
      });
    }

    if (canGoToCompetition && olCompetitionId) {
      actions.push({
        id: 'viewCompetition',
        label: t('See competition info'),
        handler: () => {
          navigation.navigate('Competition', {
            olCompetitionId,
          });
        },
      });
    }

    if (olCompetitionId && liveClassId) {
      actions.push({
        id: 'viewLiveResults',
        label: t('See class results'),
        handler: () => {
          navigation.navigate('LiveResults', {
            olCompetitionId,
            liveClassId,
          });
        },
      });
    }

    if (olCompetitionId && olOrganizationId) {
      actions.push({
        id: 'viewClubResults',
        label: t('See club results'),
        handler: () => {
          navigation.navigate('ClubResults', {
            olCompetitionId,
            olOrganizationId,
          });
        },
      });
    }

    actions.push({
      id: 'cancel',
      label: t('Cancel'),
      handler: () => {},
    });

    showActionSheetWithOptions(
      {
        options: actions.map(a => a.label),
        cancelButtonIndex: actions.length - 1,
      },
      selectedIndex => {
        if (typeof selectedIndex === 'number') {
          actions[selectedIndex]?.handler();
        }
      },
    );
  };

  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
};
