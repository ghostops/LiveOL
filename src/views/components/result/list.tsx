import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import {
    View,
    Text,
    ListItem,
    List,
    Badge,
    Switch,
    Card,
    CardItem,
} from 'native-base';
import { UNIT, COLORS } from '../../../util/const';
import Lang from '../../../lib/lang';

interface Props {
    initialResults?: Result[];
    fetcher: () => Promise<Result[]>;
    onResultPress: (result: Result) => void;
}

interface State {
    results: Result[];
    polling: boolean;
}

export class ResultList extends React.PureComponent<Props, State> {
    interval: number;
    state = { results: this.props.initialResults || null, polling: false };

    componentWillMount() {
        this.poll();
    }

    componentDidMount() {
        this.state.polling && this.startPoll();
    }

    componentWillUnmount() {
        this.clearPoll();
    }

    componentDidUpdate(prevProps, prevState: State) {
        if (this.state.polling !== prevState.polling) {
            if (this.state.polling) {
                this.poll();
                this.startPoll();
            } else {
                this.clearPoll();
            }
        }
    }

    poll = async () => {
        const results = await this.props.fetcher();
        this.setState({ results });
    }

    startPoll = () => this.interval = setInterval(this.poll, 15000);
    clearPoll = () => this.interval && clearInterval(this.interval);

    renderResult = (result: Result) => {
        return (
            <ListItem
                key={result.start + result.name}
                style={{
                    flexDirection: 'column',
                    marginLeft: 0,
                }}
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
                                {result.result}
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
                                    {result.club}
                                </Text>
                            </TouchableOpacity>

                            <Text style={{
                                fontSize: UNIT,
                                textAlign: 'right',
                            }}>
                                {result.timeplus}
                            </Text>
                        </View>
                    </View>
                </View>
            </ListItem>
        );
    }

    render() {
        if (!this.state.results) {
            return null;
        }

        return (
            <View>
                <Card style={{ marginBottom: 10 }}>
                    <CardItem style={{ paddingVertical: 8 }}>
                        <Text style={{ flex: 1, fontSize: UNIT }}>
                            {Lang.print('classes.autoUpdate')}
                        </Text>

                        <Switch
                            value={this.state.polling}
                            trackColor={{ true: COLORS.MAIN, false: COLORS.DARK }}
                            onValueChange={(polling) => this.setState({ polling })}
                        />
                    </CardItem>
                </Card>

                <List style={{
                    backgroundColor: '#FFF',
                    borderRadius: 4,
                }}>
                    {
                        this.state.results.length < 1 ?
                        (
                            <Text style={{ textAlign: 'center', paddingVertical: 10 }}>
                                {Lang.print('competitions.noClasses')}
                            </Text>
                        ) : this.state.results.map(this.renderResult)
                    }
                </List>
            </View>
        );
    }
}
