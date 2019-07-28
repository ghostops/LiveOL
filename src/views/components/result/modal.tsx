import * as React from 'react';
import { Modal, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { View, CardItem, Card, Content, Left, Right } from 'native-base';
import * as Helpers from './helpers';
import { UNIT, COLORS } from 'util/const';
import { Ionicons } from '@expo/vector-icons';
import Lang from 'lib/lang';

interface Props {
    result: Result;
    splitControls: SplitControl[];
    modalOpen: boolean;
    closeModal: () => void;
    isLive?: boolean;
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
            <CardItem
                key={`${time}:${place}${label}`}
                bordered
            >
                <Left
                    style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                    }}
                >
                    <Text style={{ fontWeight: 'bold' }}>
                        {label}
                    </Text>

                    <Text
                        style={{
                            marginTop: 5,
                            marginBottom: !!timeplus ? 5 : 0,
                        }}
                    >
                        {time} {!!place && `(${place})`}
                    </Text>

                    {
                        timeplus &&
                        <Text>
                            {timeplus}
                        </Text>
                    }
                </Left>
            </CardItem>
        );
    }

    renderClose = () => (
        <TouchableOpacity
            onPress={this.props.closeModal}
        >
            <Ionicons
                name="md-close"
                size={32}
                color="black"
            />
        </TouchableOpacity>
    )

    renderInner = () => {
        const { result, splitControls } = this.props;

        if (!result) return null;

        return (
            <Content
                style={{
                    flex: 1,
                }}
                contentContainerStyle={{
                    alignContent: 'center',
                    justifyContent: 'center',
                    padding: UNIT,
                }}
            >
                <Card
                    style={{
                        flex: 1,
                    }}
                >
                    <CardItem
                        header
                        bordered
                    >
                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: UNIT,
                                    color: COLORS.MAIN,
                                    fontWeight: 'bold',
                                }}
                            >
                                {Lang.print('classes.resultsFor')}: {result.name}
                            </Text>

                            {
                                this.props.isLive &&
                                <Text
                                    style={{
                                        fontSize: UNIT * 0.75,
                                        marginTop: 4,
                                    }}
                                >
                                    {Lang.print('classes.autoUpdateEnabled')}
                                </Text>
                            }
                        </View>

                        {this.renderClose()}
                    </CardItem>
                    {this.renderTime('Start', Helpers.startToReadable(result.start))}
                    {splitControls.map(this.renderSplit)}
                    {this.renderTime('Result', result.result, result.timeplus, result.place)}
                </Card>
            </Content>
        );
    }

    render() {
        return (
            <Modal
                visible={this.props.modalOpen}
                onRequestClose={() => {}}
                animationType="fade"
                transparent
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
            </Modal>
        );
    }
}
