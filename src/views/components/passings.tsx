import * as React from 'react';
import { Dimensions, Animated } from 'react-native';
import {
    View,
    Spinner,
    Text,
    List,
    ListItem,
} from 'native-base';
import { getPasses } from 'api';

interface Props {
    comp: number;
    active: boolean;
    onClose: () => void;
}

interface State {
    animation: Animated.Value;
    passings: Passing[];
}

const HEIGHT = Dimensions.get('window').height;

export class OLPassings extends React.PureComponent<Props, State> {
    state = {
        animation: new Animated.Value(HEIGHT),
        passings: null,
    };

    getPasses = async () => {
        const passings = await getPasses(this.props.comp);
        this.setState({ passings });
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.active !== this.props.active) {
            if (this.props.active) {
                this.getPasses();

                Animated.timing(
                    this.state.animation,
                    { toValue: 0, useNativeDriver: true },
                ).start();
            } else {
                Animated.timing(
                    this.state.animation,
                    { toValue: HEIGHT, useNativeDriver: true },
                ).start();
            }
        }
    }

    renderResult = (passing: Passing) => {
        return (
            <ListItem 
                key={passing.time + passing.runnerName}
                style={{
                    flexDirection: 'column',
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                }}>
                    <View style={{ flex: 1 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <Text style={{ textAlign: 'left', flex: 1 }}>{passing.class}</Text>
                            <Text style={{ marginLeft: 10, fontSize: 22 }}>
                                {passing.runnerName}
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <Text>{passing.passtime}</Text>
                        </View>
                    </View>
                </View>
            </ListItem>
        );
    }

    renderInner = () => {
        return (
            <List>
                {this.state.passings.map(this.renderResult)}
            </List>
        );
    }

    render() {
        return (
            <Animated.View pointerEvents="none" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'white',
                transform: [{ translateY: this.state.animation }],
            }}>
                <View style={{ flex: 1 }}>
                    {
                        this.state.passings
                        ? this.renderInner()
                        : <Spinner color="#e86a1e" />
                    }
                </View>
            </Animated.View>
        );
    }
}
