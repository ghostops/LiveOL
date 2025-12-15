/* eslint-disable react/no-unstable-nested-components */
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'react-native';
import { OLProfile } from '~/views/scenes/profile';
import { NavigationContainer } from '@react-navigation/native';
import { HomeHeader } from '~/views/scenes/home/header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '~/util/const';
import { BackButton } from './backButton';
import { OLLanguageModal } from '~/views/scenes/language_modal/component';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { OLSceneHome } from '~/views/scenes/home';
import { OLSceneTracking } from '~/views/scenes/tracking';
import { OLSceneEditTrackRunner } from '~/views/scenes/tracking/edit';
import { OLSceneCompetition } from '~/views/scenes/competition';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';
import { OLSceneLiveResults } from '~/views/scenes/live-results';
import { OLSceneClubResults } from '~/views/scenes/club-results';
import { OLSceneTrackingResults } from '~/views/scenes/tracking/results';
import { OLSceneSearch } from '~/views/scenes/search';
import { TrackingInfoScreen } from '~/views/scenes/profile/TrackingInfoScreen';
import { TrackingInfoIcon } from '~/views/components/TrackingInfoIcon';
import { OLTrackingFormMode } from '~/views/components/tracking/form';

export type TabStack = {
  Home: undefined;
  Profile: undefined;
  Tracking: undefined;
};

export type RootStack = {
  HomeTabs: undefined;
  Competition: { olCompetitionId: string };
  Info: undefined;
  Language: undefined;
  Search: undefined;
  Redeem: undefined;
  LiveResults: { olCompetitionId: string; liveClassId: string };
  ClubResults: { olCompetitionId: string; olOrganizationId: string };
  EditTrackRunner: {
    mode: OLTrackingFormMode;
    trackingId?: number;
    runner?: {
      name: string;
      clubs: string[];
      classes: string[];
    };
  };
  TrackingResults: {
    title: string;
    trackingId: number;
  };
  TrackingInfo: undefined;
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
        title: '...',
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
              {t('Following')}
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
              name={focused ? 'list' : 'list-outline'}
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
              {t('Competitions')}
            </OLText>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={OLProfile}
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
              {t('Me')}
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
            color: COLORS.WHITE,
          },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          title: '...',
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
          name="Competition"
          component={OLSceneCompetition}
          options={{}}
        />
        <Stack.Screen
          name="LiveResults"
          component={OLSceneLiveResults}
          options={{ title: '...' }}
        />
        <Stack.Screen
          name="ClubResults"
          component={OLSceneClubResults}
          options={{ title: '...' }}
        />
        <Stack.Screen
          name="EditTrackRunner"
          component={OLSceneEditTrackRunner}
          options={({ route }) => ({
            title:
              route.params.mode === 'create'
                ? t('Add Runner')
                : t('Edit Runner'),
            headerRight: () => (
              <TrackingInfoIcon isHeader color={COLORS.WHITE} />
            ),
          })}
        />
        <Stack.Screen
          name="TrackingResults"
          component={OLSceneTrackingResults}
        />

        <Stack.Group
          screenOptions={{
            headerLeft: () => <BackButton cross />,

            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen
            name="Language"
            component={OLLanguageModal}
            options={{
              title: t('Pick language'),
            }}
          />
          <Stack.Screen
            name="Search"
            component={OLSceneSearch}
            options={{
              title: t('Search'),
            }}
          />
          <Stack.Screen
            name="TrackingInfo"
            component={TrackingInfoScreen}
            options={{
              title: t('How following a runner works'),
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Component;
