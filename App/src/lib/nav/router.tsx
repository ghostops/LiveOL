/* eslint-disable react/no-unstable-nested-components */
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'react-native';
import { OLResults } from '~/views/scenes/results/container';
import { OLInfo } from '~/views/scenes/info/container';
import { OLHome } from '~/views/scenes/home/container';
import { OLCompetition } from '~/views/scenes/competition/container';
import { OLClubResults } from '~/views/scenes/club/container';
import { NavigationContainer } from '@react-navigation/native';
import { HomeHeader } from '~/views/scenes/home/header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '~/util/const';
import { BackButton } from './backButton';
import { ResultMenuIcon } from '~/views/scenes/results/menuIcon';
import { OLPlus } from '~/views/scenes/plus/container';
import { ClubMenuIcon } from '~/views/scenes/club/menuIcon';
import { OLPlusFeatureKey } from '~/views/scenes/plus/component';
import { OLRedeemCode } from '~/views/scenes/redeem_modal/component';
import { OLLanguageModal } from '~/views/scenes/language_modal/component';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { OLTrackRunner } from '~/views/scenes/track/container';
import type { OLTrackingData } from '~/views/components/follow/followSheet';
import { OLEditTrackRunner } from '~/views/scenes/track-edit/container';

export type RootStack = {
  Home: undefined;
  Info: undefined;
  Competition: {
    competitionId: number;
    title: string;
  };
  Results: {
    className: string;
    competitionId: number;
    runnerId?: string;
  };
  Club: {
    clubName: string;
    competitionId: number;
    title: string;
  };
  Plus?: {
    feature?: OLPlusFeatureKey;
  };
  Redeem: undefined;
  Language: undefined;
  TrackRunner: { runner: OLTrackingData };
  EditTrackRunner:
    | { status: 'new' }
    | { status: 'edit'; runner: OLTrackingData }
    | { status: 'create-from'; runner: Omit<OLTrackingData, 'id'> };
};

const Stack = createNativeStackNavigator<RootStack>();

const Component: React.FC = () => {
  const { t } = useTranslation();
  const { setNavRef } = useOLNavigationRef();

  return (
    <NavigationContainer ref={setNavRef}>
      <StatusBar translucent />

      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerLeft: () => <BackButton />,
          headerStyle: {
            backgroundColor: COLORS.MAIN,
          },
          headerTitleStyle: {
            color: '#fff',
          },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="Home"
          component={OLHome}
          options={{
            header: () => <HomeHeader />,
          }}
        />

        <Stack.Screen
          name="Info"
          component={OLInfo}
          options={{ title: t('info.title') }}
        />

        <Stack.Screen
          name="Competition"
          component={OLCompetition}
          options={props => ({
            title: props.route.params.title,
          })}
        />

        <Stack.Screen
          name="Results"
          component={OLResults}
          options={props => ({
            title: `${t('classes.resultsFor')}: ${props.route.params.className as string}`,
            headerRight: () => <ResultMenuIcon />,
          })}
          initialParams={{
            competitionId: 16011,
            className: 'M20-1',
          }}
        />

        <Stack.Screen
          name="Club"
          component={OLClubResults}
          options={props => ({
            title: props.route.params.title,
            headerRight: () => <ClubMenuIcon />,
          })}
        />

        <Stack.Screen
          name="Plus"
          component={OLPlus}
          options={{
            title: 'LiveOL+',
          }}
        />

        <Stack.Screen
          name="TrackRunner"
          component={OLTrackRunner}
          options={{
            title: '',
          }}
        />

        <Stack.Screen
          name="EditTrackRunner"
          component={OLEditTrackRunner}
          options={{
            title: '',
          }}
        />

        <Stack.Group
          screenOptions={{
            headerLeft: () => <BackButton cross />,

            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen
            name="Redeem"
            component={OLRedeemCode}
            options={{ title: t('plus.code.redeem') }}
          />
          <Stack.Screen
            name="Language"
            component={OLLanguageModal}
            options={{
              title: t('language.pick'),
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Component;
