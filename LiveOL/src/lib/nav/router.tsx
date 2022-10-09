// import { COLORS, px } from 'util/const';
// import { createStackNavigator } from '@react-navigation/stack';
// import { Lang } from 'lib/lang';
// import { Mappings } from './mappings';
// import { NavigationContainer } from '@react-navigation/native';
// import { Right, Left } from 'views/scenes/home/header';
// import { Routes } from './routes';
// import { StatusBar } from 'react-native';
// import { AudioControlls } from 'views/scenes/results/audio';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from 'lib/nav/routes';
import { StatusBar } from 'react-native';
import { OLHome } from 'views/scenes/home/container';

const Stack = createNativeStackNavigator();

const Component: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar translucent />

      <Stack.Navigator
        initialRouteName={Routes.home}
        screenOptions={{
          // headerBackTitle: Lang.print('back'),
          // headerTitleContainerStyle: {
          //   width: '65%',
          //   alignItems: 'center',
          // },
          headerStyle: {
            // height: top + px(50),
          },
        }}>
        <Stack.Screen
          name={Routes.home}
          component={OLHome}
          // options={props => ({
          //   title: Lang.print('home.title'),
          //   headerLeft: () => <Left />,
          //   headerRight: () => (
          //     <Right onPress={() => props.navigation.navigate(Routes.info)} />
          //   ),
          // })}
        />

        {/* <Stack.Screen
          name={Routes.competition}
          component={Mappings[Routes.competition]}
          options={props => ({
            title: props.route.params.title,
          })}
        />

        <Stack.Screen
          name={Routes.info}
          component={Mappings[Routes.info]}
          options={() => ({
            title: Lang.print('info.title'),
          })}
        />

        <Stack.Screen
          name={Routes.passings}
          component={Mappings[Routes.passings]}
          options={props => ({
            title: props.route.params.title,
          })}
        />

        <Stack.Screen
          name={Routes.results}
          component={Mappings[Routes.results]}
          options={props => ({
            title: `${Lang.print('classes.resultsFor')}: ${
              props.route.params.className as string
            }`,
            headerRight: () => <AudioControlls />,
          })}
          initialParams={{
            id: 16011,
            className: 'M20-1',
          }}
        />

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
