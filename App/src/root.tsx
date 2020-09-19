import * as React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { client } from 'lib/graphql/client';
import { COLORS } from 'util/const';
import { Lang } from 'lib/lang';
import { LayoutAnimation, View } from 'react-native';
import { OLPush } from 'views/components/notifications/push';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { Provider } from 'react-redux';
import { Root } from 'native-base';
import { store } from 'store/configure';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import Router from 'lib/nav/router';


interface State {
    ready: boolean;
}

window['clog'] = (...props) => console.warn(JSON.stringify(props));

export default class AppRoot extends React.Component<{}, State> {
    state = {
        ready: false,
    };

    constructor(props) {
        super(props);
        this.onLaunch();
    }

    onLaunch = async () => {
        await SplashScreen.preventAutoHideAsync();

        await this.checkForUpdates();

        await Lang.init();

        await Font.loadAsync({
            // Android??
            Roboto_medium: require('../assets/fonts/Proxima-Nova-Bold-regular.otf'),
            Roboto: require('../assets/fonts/Proxima-Nova.ttf'),

            Proxima_Nova_Bold: require('../assets/fonts/Proxima-Nova-Bold-regular.otf'),
            Proxima_Nova: require('../assets/fonts/Proxima-Nova.ttf'),
            Rift_Bold: require('../assets/fonts/Rift-Bold.otf'),
            Rift_Bold_Italic: require('../assets/fonts/Rift-Bold-Italic-regular.otf'),
        });

        setTimeout(
            () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.setState({ ready: true }, () => SplashScreen.hideAsync());
            },
            1000,
        );
    }

    checkForUpdates = async () => {
        if (__DEV__) return;

        const { isAvailable } = await Updates.checkForUpdateAsync();

        if (isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        }
    }

    render() {
        if (!this.state.ready) {
            return null;
        }

        return (
            <ApolloProvider client={client}>
                <Root>
                    <View style={{ flex: 1 }}>
                        <Provider store={store.store}>
                            <OLRotationWatcher>
                                <Router />
                            </OLRotationWatcher>

                            {/* <OLPush /> */}
                        </Provider>
                    </View>
                </Root>
            </ApolloProvider>
        );
    }
}
