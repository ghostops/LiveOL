import * as React from 'react';
import { Modal, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo';
import { View } from 'native-base';
import * as Helpers from './helpers';

interface Props {
    result: Result;
    splitControls: SplitControl[];
    modalOpen: boolean;
    closeModal: () => void;
}

export class ResultsModal extends React.PureComponent<Props> {
    renderSplit = (split: SplitControl) => {
        const data = Helpers.getSplitData(split, this.props.result);

        return this.renderTime(
            split.name,
            Helpers.splitTimestampToReadable(data.time),
            Helpers.timeplusToReadable(data.timeplus),
            data.place,
        );
    }

    renderTime = (
        label: string,
        time: string,
        timeplus?: string,
        place?: string,
    ) => {
        return (
            <View>
                <Text style={{ color: 'white' }}>
                    {label}
                </Text>

                <Text>
                    {time} {!!place && `(${place})`}
                </Text>

                <Text>
                    {timeplus}
                </Text>
            </View>
        );
    }

    renderInner = () => {
        const { result, splitControls } = this.props;

        if (!result) return null;

        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {this.renderTime('Start', Helpers.startToReadable(result.start))}
                {splitControls.map(this.renderSplit)}
                {this.renderTime('Result', result.result, result.timeplus, result.place)}
            </View>
        );
    }

    render() {
        return (
            <Modal
                visible={this.props.modalOpen}
                animationType="fade"
                transparent
            >
                <TouchableOpacity
                    onPress={this.props.closeModal}
                    style={{ flex: 1 }}
                    activeOpacity={1}
                >
                    <BlurView
                        tint="dark"
                        intensity={100}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    >
                        {this.renderInner()}
                    </BlurView>
                </TouchableOpacity>
            </Modal>
        );
    }
}
