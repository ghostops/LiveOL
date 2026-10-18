/* eslint-disable react/no-unstable-nested-components */
import { useTranslation } from 'react-i18next';
import { Platform, StatusBar } from 'react-native';
import { OLProfile } from '~/views/scenes/profile';
import { NavigationContainer } from '@react-navigation/native';
import { HomeHeader } from '~/views/scenes/home/header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import type { AppleIcon } from 'react-native-bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { COLORS } from '~/util/const';
import { BackButton } from './backButton';
import { OLLanguageModal } from '~/views/scenes/language_modal/component';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { OLSceneHome } from '~/views/scenes/home';
import { OLSceneTracking } from '~/views/scenes/tracking';
import { OLSceneEditTrackRunner } from '~/views/scenes/tracking/edit';
import { OLSceneCompetition } from '~/views/scenes/competition';
import { OLSceneLiveResults } from '~/views/scenes/live-results';
import { OLSceneClubResults } from '~/views/scenes/club-results';
import { OLSceneTrackingResults } from '~/views/scenes/tracking/results';
import { OLSceneSearch } from '~/views/scenes/search';
import { TrackingInfoScreen } from '~/views/scenes/profile/TrackingInfoScreen';
import { TrackingInfoIcon } from '~/views/components/TrackingInfoIcon';
import { OLTrackingFormMode } from '~/views/components/tracking/form';
import { OLSceneSettings } from '~/views/scenes/settings';
import { OLSceneChangelog } from '~/views/scenes/changelog';
import { OLSceneNotificationSettings } from '~/views/scenes/notifications';

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
  Settings: undefined;
  NotificationSettings: undefined;
  Changelog: undefined;
  LiveResults: { olCompetitionId: string; liveClassId: string };
  ClubResults: { olCompetitionId: string; olOrganizationId: string };
  EditTrackRunner: {
    mode: OLTrackingFormMode;
    trackingId?: number;
    runner?: {
      name: string;
      clubs: string[];
    };
  };
  TrackingResults: {
    title: string;
    trackingId: number;
  };
  TrackingInfo: undefined;
};

const Stack = createNativeStackNavigator<RootStack>();
const Tabs = createNativeBottomTabNavigator<TabStack>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// iOS gets SF Symbols so the native tab bar (Liquid Glass on iOS 26) can tint them,
// Android gets the Ionicons rendered to images
const tabIcon =
  (
    sfSymbol: AppleIcon['sfSymbol'],
    ionicon: IoniconName,
    ioniconFocused: IoniconName,
  ) =>
  ({ focused }: { focused: boolean }) =>
    Platform.OS === 'ios'
      ? { sfSymbol }
      : Ionicons.getImageSourceSync(
          focused ? ioniconFocused : ionicon,
          24,
          COLORS.WHITE,
        )!;

const OLHomeTabs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBarActiveTintColor={Platform.OS === 'ios' ? COLORS.MAIN : COLORS.WHITE}
      tabBarInactiveTintColor={
        Platform.OS === 'ios' ? undefined : 'rgba(255, 255, 255, 0.8)'
      }
      tabBarStyle={
        Platform.OS === 'ios' ? undefined : { backgroundColor: COLORS.MAIN }
      }
      activeIndicatorColor={COLORS.DARK}
      screenOptions={{
        title: '...',
      }}
    >
      <Tabs.Screen
        name="Tracking"
        component={OLSceneTracking}
        options={{
          tabBarLabel: t('Following'),
          tabBarIcon: tabIcon('person.2.fill', 'people-outline', 'people'),
        }}
      />
      <Tabs.Screen
        name="Home"
        component={OLSceneHome}
        options={{
          tabBarLabel: t('Competitions'),
          tabBarIcon: tabIcon('list.bullet', 'list-outline', 'list'),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={OLProfile}
        options={{
          tabBarLabel: t('Me'),
          tabBarIcon: tabIcon('person.fill', 'person-outline', 'person'),
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
        <Stack.Screen
          name="Settings"
          component={OLSceneSettings}
          options={{
            title: t('Settings'),
          }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={OLSceneNotificationSettings}
          options={{
            title: t('Notifications'),
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
          <Stack.Screen
            name="Changelog"
            component={OLSceneChangelog}
            options={{
              title: t("What's New"),
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Component;
