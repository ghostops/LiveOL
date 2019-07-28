import * as React from 'react';
import Router from './lib/nav/router';
import Lang from './lib/lang';
import { LayoutAnimation, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { COLORS } from './util/const';

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

    async componentWillMount() {
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

    render() {
        const RouterView = Router();
        return (
            this.state.ready
            ? <RouterView />
            : <View style={{ flex: 1, borderStartColor: COLORS.MAIN }} />
        );
    }
}
