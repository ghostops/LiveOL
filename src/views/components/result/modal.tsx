import * as React from 'react';
import { Modal, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo';
import { View } from 'native-base';

interface Props {
    result: Result;
    splitControls: SplitControl[];
    modalOpen: boolean;
    closeModal: () => void;
}

export class ResultsModal extends React.PureComponent<Props> {
    renderSplit = (split: SplitControl) => {
        const result = this.props.result;

        const getSplitData = () => {
            const keys = Object.keys(result.splits);
            const foundKeys = keys.filter((key) => key.includes(String(split.code)));
            const keyValue = {};

            for (const key of foundKeys) {
                if (Number(key) === split.code) {
                    keyValue['time'] = result.splits[key];
                } else {
                    const newKey = key.replace(`${split.code}_`, '');
                    keyValue[newKey] = result.splits[key];
                }
            }

            return {
                time: keyValue['time'] || NaN,
                status: keyValue['status'] || NaN,
                place: keyValue['place'] || NaN,
                timeplus: keyValue['timeplus'] || NaN,
            };
        };

        return (
            <View key={split.code}>
                <Text style={{ color: 'white' }}>
                    {split.name}
                </Text>

                <Text>
                    {getSplitData().time}
                </Text>
            </View>
        );
    }

    renderInner = () => {
        const result = this.props.result;

        if (!result) return null;

        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {this.props.splitControls.map(this.renderSplit)}
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
