import * as React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import {
    View,
    Text,
    ListItem,
    Badge,
} from 'native-base';
import { statusI18n } from 'lib/lang/status';
import { UNIT, COLORS } from 'util/const';
import * as _ from 'lodash';

interface Props {
    result: Result;
    openModal: (result: Result) => void;
    onResultPress: (result: Result) => void;
    subtitle: string;
}

interface State {
    highlight: boolean;
    animation: Animated.Value;
}

export class ResultBox extends React.PureComponent<Props, State> {
    timeout: NodeJS.Timeout;

    state: State = {
        highlight: false,
        animation: new Animated.Value(0),
    };

    hasChanged = (prevProps: Props) => (
        (
            prevProps.result.place !==
            this.props.result.place
        ) ||
        (
            prevProps.result.result !==
            this.props.result.result
        ) ||
        (
            prevProps.result.status !==
            this.props.result.status
        )
    )

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.hasChanged(prevProps)) {
            this.setState(
                { highlight: true },
                () => {
                    this.startAnimation();

                    this.timeout = setTimeout(
                        () => {
                            this.setState(
                                { highlight: false },
                                () => this.stopAnimation(),
                            );
                        },
                        600,
                    );
                },
            );
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    startAnimation = () => {
        Animated.timing(
            this.state.animation,
            {
                toValue: 1,
                duration: 500,
            },
        ).start();
    }

    stopAnimation = () => {
        Animated.timing(
            this.state.animation,
            {
                toValue: 0,
                duration: 500,
            },
        ).start();
    }

    wrapInAnimation = (child: React.ReactNode) => {
        const backgroundColor = this.state.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', 'rgba(255,0,0,.5)'],
        });
        return (
            <Animated.View style={{ backgroundColor }}>
                {child}
            </Animated.View>
        );
    }

    render() {
        const { result } = this.props;

        return this.wrapInAnimation(
            <ListItem
                style={{
                    flexDirection: 'column',
                    marginLeft: 0,
                    paddingHorizontal: 10,
                }}
                onPress={() => this.props.openModal(result)}
            >
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                }}>
                    <View style={{
                        paddingRight: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {
                            result.place.length > 0 &&
                            result.place !== '-' &&
                            <Badge style={{ backgroundColor: COLORS.MAIN }}>
                                <Text style={{
                                    fontSize: UNIT,
                                }}>
                                    {result.place}
                                </Text>
                            </Badge>
                        }
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <Text numberOfLines={1} style={{
                                textAlign: 'left',
                                fontSize: UNIT,
                                flex: 1,
                            }}>
                                {result.name}
                            </Text>
                            <Text style={{
                                marginLeft: 10,
                                fontSize: UNIT * 1.35,
                            }}>
                                {
                                    result.status === 0
                                    ? result.result
                                    : statusI18n(result.status)
                                }
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <TouchableOpacity
                                onPress={() => this.props.onResultPress(result)}
                                style={{
                                    flex: 1,
                                    maxWidth: '90%',
                                }}
                            >
                                <Text numberOfLines={1} style={{
                                    color: COLORS.MAIN,
                                    fontSize: UNIT,
                                }}>
                                    {
                                        this.props.subtitle === 'class'
                                        ? result.class
                                        : result.club
                                    }
                                </Text>
                            </TouchableOpacity>

                            <View style={{
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end',
                            }}>
                                {
                                    Boolean(result.status) &&
                                    <Text style={{
                                        fontSize: (
                                            result.status === 0
                                            ? UNIT
                                            : UNIT * .75
                                        ),
                                        textAlign: 'right',
                                    }}>
                                        {
                                            result.status === 0
                                            ? result.timeplus
                                            : `(${statusI18n(result.status, 'long')})`
                                        }
                                    </Text>
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </ListItem>,
        );
    }
}
