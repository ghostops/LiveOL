/* eslint-disable react/no-unstable-nested-components */
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'react-native';
import { OLInfo } from '~/views/scenes/info/container';
import { NavigationContainer } from '@react-navigation/native';
import { HomeHeader } from '~/views/scenes/home/header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '~/util/const';
import { BackButton } from './backButton';
import { OLRedeemCode } from '~/views/scenes/redeem_modal/component';
import { OLLanguageModal } from '~/views/scenes/language_modal/component';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { OLSceneHome } from '~/views/scenes/home';
import { OLSceneTracking } from '~/views/scenes/tracking';
import { OLSceneCompetition } from '~/views/scenes/competition';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';

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
  Redeem: undefined;
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
          name="Competition"
          component={OLSceneCompetition}
          options={{}}
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
