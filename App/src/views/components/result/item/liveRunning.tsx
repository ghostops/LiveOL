import * as React from 'react';
import { View, Text } from 'native-base';
import { fontPx } from 'util/const';
import { statusI18n } from 'lib/lang/status';
import { secondsFromDate, padTime } from 'util/date';

interface Props {
    date: string;
}

interface State {
    value: string;
}

export class OLResultLiveRunning extends React.PureComponent<Props, State> {
    state: State = { value: null };

    interval;

    componentDidMount() {
        this.startCounting();
    }

    componentWillUnmount() {
        this.stopCounting();
    }

    stopCounting = () => {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    startCounting = () => {
        this.interval = setInterval(
            () => {
                const minutes = Math.floor(secondsFromDate(this.props.date) / 60);
                const seconds = Math.floor(secondsFromDate(this.props.date) - (minutes * 60));

                const value = `${padTime(minutes)}:${padTime(seconds)}`;

                this.setState({ value });
            },
        );
    }

    render() {
        // DISABLE UNTIL FIXED
        return null;

        if (!this.state.value) return null;

        return (
            <Text style={{
                fontSize: fontPx(20),
            }}>
                {this.state.value}
            </Text>
        );
    }
}
