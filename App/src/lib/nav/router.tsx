import * as React from 'react';
import { COLORS, px } from 'util/const';
import { connect } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { Mappings } from './mappings';
import { NavigationContainer, TypedNavigator, ParamListBase } from '@react-navigation/native';
import { Routes } from './routes';
import { Lang } from 'lib/lang';
import { ScreenOrientation } from 'expo';
import { xtraSpace, hasNotch } from 'util/hasNotch';

interface StateProps {
    landscape: boolean;
}

const Stack = createStackNavigator();

const Component: React.SFC<StateProps> = ({ landscape }) => {
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
                initialRouteName={Routes.results}
                screenOptions={{
                    headerBackTitle: Lang.print('back'),
                    headerBackTitleStyle: {
                        color: 'white',
                    },
                    headerTitleContainerStyle: {
                        width: '65%',
                        alignItems: 'center',
                    },
                    headerStatusBarHeight: px(20) + (hasNotch && !landscape ? xtraSpace : 0),
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

const mapStateToProps = (state: AppState): StateProps => ({
    landscape: state.general.rotation === ScreenOrientation.Orientation.LANDSCAPE,
});

export default connect(mapStateToProps, null)(Component);
