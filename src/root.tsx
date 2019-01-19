import * as React from 'react';
import Router from './lib/nav/router';
import Lang from './lib/lang';
import { LayoutAnimation, View } from 'react-native';
import { SplashScreen } from 'expo';
import { COLORS } from './util/const';

interface State {
    ready: boolean;
}

export default class AppRoot extends React.PureComponent<any, State> {
    state = {
        ready: false,
    };

    constructor(props) {
        super(props);
        SplashScreen.preventAutoHide();
    }

    async componentWillMount() {
        await Lang.init();
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
        return (
            this.state.ready
            ? <Router />
            : <View style={{ flex: 1, borderStartColor: COLORS.MAIN }} />
        );
    }
}
