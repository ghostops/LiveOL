import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'react-native';
import { OLResults } from 'views/scenes/results/container';
import { OLPassings } from 'views/scenes/last_passings/container';
import { OLInfo } from 'views/scenes/info/container';
import { OLHome } from 'views/scenes/home/container';
import { OLCompetition } from 'views/scenes/competition/container';
import { OLClubResults } from 'views/scenes/club/container';
import { NavigationContainer } from '@react-navigation/native';
import { HomeHeader } from 'views/scenes/home/header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from 'util/const';
import { BackButton } from './backButton';
import { AudioControlls } from 'views/scenes/results/audio';

export type RootStack = {
  Home: undefined;
  Info: undefined;
  Competition: {
    competitionId: number;
    title: string;
  };
  Passings: {
    competitionId: number;
    title: string;
  };
  Results: {
    className: string;
    competitionId: number;
  };
  Club: {
    clubName: string;
    competitionId: number;
    title: string;
  };
};

const Stack = createNativeStackNavigator<RootStack>();

const Component: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
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
          name="Passings"
          component={OLPassings}
          options={props => ({
            title: props.route.params.title,
          })}
        />

        <Stack.Screen
          name="Results"
          component={OLResults}
          options={props => ({
            title: `${t('classes.resultsFor')}: ${
              props.route.params.className as string
            }`,
            headerRight: () => <AudioControlls />,
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
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Component;
