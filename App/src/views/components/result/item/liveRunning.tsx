import * as React from 'react';
import { diffDateNow, padTime } from 'util/date';
import { fontPx } from 'util/const';
import { statusI18n } from 'lib/lang/status';
import { View, Text } from 'native-base';

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
                const value = diffDateNow(this.props.date);

                this.setState({ value });
            },
        );
    }

    render() {
        if (!this.state.value) {
            return null;
        }

        return (
            <Text style={{
                fontSize: fontPx(20),
            }}>
                {this.state.value}
            </Text>
        );
    }
}
