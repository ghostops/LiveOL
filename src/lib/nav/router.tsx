import * as React from 'react';
import { NavigationContainer, TypedNavigator, ParamListBase } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { Routes } from './routes';
import { Mappings } from './mappings';
import { COLORS } from 'util/const';
import Lang from 'lib/lang';
import { StackNavigator } from 'react-navigation';

// Import hack
const StackImport = require('@react-navigation/stack/lib/commonjs');
const Stack: TypedNavigator<ParamListBase, StackNavigationOptions, any> =
    StackImport.createStackNavigator();

export default () => {
    return (
        <NavigationContainer
            theme={{
                colors: {
                    text: 'white',
                    background: 'white',
                    border: 'white',
                    card: COLORS.MAIN,
                    primary: 'white',
                },
                dark: false,
            }}
        >
            <Stack.Navigator
                initialRouteName={Routes.home}
                screenOptions={{
                    headerBackTitle: Lang.print('back'),
                    headerBackTitleStyle: {
                        color: 'white',
                    },
                    headerTitleContainerStyle: {
                        width: '65%',
                        alignItems: 'center',
                    },
                }}
            >
                {Object.keys(Mappings).map((key) => (
                    <Stack.Screen
                        key={key}
                        name={key}
                        component={Mappings[key]}
                        initialParams={{
                            id: 17075,
                            className: 'DE',
                        }}
                    />
                ))}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
