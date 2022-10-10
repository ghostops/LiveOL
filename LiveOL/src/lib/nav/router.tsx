import { COLORS } from 'util/const';
// import { createStackNavigator } from '@react-navigation/stack';
// import { Lang } from 'lib/lang';
// import { Mappings } from './mappings';
// import { NavigationContainer } from '@react-navigation/native';
// import { Right, Left } from 'views/scenes/home/header';
// import { Routes } from './routes';
// import { StatusBar } from 'react-native';
import { AudioControlls } from 'views/scenes/results/audio';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { OLHome } from 'views/scenes/home/container';
import { HomeHeader } from 'views/scenes/home/header';
import { OLInfo } from 'views/scenes/info/container';
import { useTranslation } from 'react-i18next';
import { BackButton } from './backButton';
import { OLCompetition } from 'views/scenes/competition/container';
import { OLPassings } from 'views/scenes/last_passings/container';
import { OLResults } from 'views/scenes/results/container';

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
    id: number;
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
        initialRouteName="Results"
        screenOptions={{
          headerLeft: () => <BackButton />,
          headerStyle: {
            backgroundColor: COLORS.MAIN,
          },
          headerTitleStyle: {
            color: '#fff',
          },
          headerShadowVisible: false,
        }}>
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

        {/*
        *}


        <Stack.Screen
          name={Routes.club}
          component={Mappings[Routes.club]}
          options={props => ({
            title: props.route.params.title,
          })}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Component;
