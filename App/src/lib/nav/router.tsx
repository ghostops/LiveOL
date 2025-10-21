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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import { OLSceneHome } from '~/views/scenes/homev2';
import { OLSceneTracking } from '~/views/scenes/tracking';
import { OLSceneCompetitionV2 } from '~/views/scenes/competitionv2';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';

export type TabStack = {
  Home: undefined;
  Profile: undefined;
  Tracking: undefined;
};

export type RootStack = {
  HomeTabs: undefined;
  CompetitionV2: { olCompetitionId: string };

  // Old
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
const Tabs = createBottomTabNavigator<TabStack>();

const OLHomeTabs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.MAIN,
          borderTopColor: COLORS.DARK,
        },
      }}
      initialRouteName="Home"
    >
      <Tabs.Screen
        name="Tracking"
        component={OLSceneTracking}
        options={{
          tabBarIcon: ({ focused }) => (
            <OLIcon
              name={focused ? 'people' : 'people-outline'}
              size={20}
              color={COLORS.WHITE}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <OLText
              size={11}
              style={{ opacity: focused ? 1 : 0.8, color: COLORS.WHITE }}
            >
              {t('tabs.follow')}
            </OLText>
          ),
        }}
      />
      <Tabs.Screen
        name="Home"
        component={OLSceneHome}
        options={{
          tabBarIcon: ({ focused }) => (
            <OLIcon
              name={focused ? 'search' : 'search-outline'}
              size={20}
              color={COLORS.WHITE}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <OLText
              size={11}
              style={{ opacity: focused ? 1 : 0.8, color: COLORS.WHITE }}
            >
              {t('tabs.home')}
            </OLText>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={OLInfo}
        options={{
          tabBarIcon: ({ focused }) => (
            <OLIcon
              name={focused ? 'person' : 'person-outline'}
              size={20}
              color={COLORS.WHITE}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <OLText
              size={11}
              style={{ opacity: focused ? 1 : 0.8, color: COLORS.WHITE }}
            >
              {t('tabs.profile')}
            </OLText>
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

const Component: React.FC = () => {
  const { t } = useTranslation();
  const { setNavRef } = useOLNavigationRef();

  return (
    <NavigationContainer ref={setNavRef}>
      <StatusBar translucent />

      <Stack.Navigator
        initialRouteName="HomeTabs"
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
          name="HomeTabs"
          component={OLHomeTabs}
          options={{
            header: () => <HomeHeader />,
          }}
        />
        <Stack.Screen
          name="CompetitionV2"
          component={OLSceneCompetitionV2}
          options={{}}
        />

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
