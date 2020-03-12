import * as React from 'react';
import { COLORS } from 'util/const';
import { Lang } from 'lib/lang';
import { LayoutAnimation, View } from 'react-native';
import { loadCompetitions } from 'store/stores/api';
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
        store.store.dispatch<any>(loadCompetitions());

        await Lang.init();

        await Font.loadAsync({
            Roboto_medium: require('../assets/fonts/Roboto-Bold.ttf'),
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

    renderWhenReady = (children: React.ReactNode) => {
        return (
            this.state.ready
            ? children
            : <View style={{ flex: 1, backgroundColor: COLORS.MAIN }} />
        );
    }

    render() {
        return this.renderWhenReady(
            <Root>
                <View style={{ flex: 1 }}>
                    <Provider store={store.store}>
                        <OLRotationWatcher>
                            <Router />
                        </OLRotationWatcher>
                    </Provider>
                </View>
            </Root>,
        );
    }
}
