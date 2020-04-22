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
import { SplashScreen } from 'expo';
import { store } from 'store/configure';
import * as Font from 'expo-font';
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
        SplashScreen.preventAutoHide();
    }

    // tslint:disable-next-line: function-name
    async UNSAFE_componentWillMount() {
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
                SplashScreen.hide();
                this.setState({ ready: true });
            },
            1000,
        );
    }

    render() {
        if (!this.state.ready) {
            return <View style={{ flex: 1, backgroundColor: COLORS.MAIN }} />;
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
