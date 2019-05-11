import * as React from 'react';
import { TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
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
import { UNIT, COLORS } from 'util/const';
import Lang from 'lib/lang';
import { statusI18n } from 'lib/lang/status';
import { ResultsModal } from './modal';

interface Props {
    initialResults?: Result[];
    fetcher: () => Promise<Result[]>;
    onResultPress: (result: Result) => void;
    search?: (results: Result[]) => Result[];
    subtitle?: 'class' | 'club';
    splitControls: SplitControl[];
}

interface State {
    results: Result[];
    polling: boolean;
    loading: boolean;
    modalOpen: boolean;
    modalResult: Result;
}

export class ResultList extends React.PureComponent<Props, State> {
    static defaultProps: Partial<Props> = {
        subtitle: 'class',
    };

    interval: NodeJS.Timeout;
    state: State = {
        results: this.props.initialResults || null,
        polling: false,
        loading: false,
        modalOpen: false,
        modalResult: null,
    };

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

    openModal = (modalResult: Result) => this.setState({ modalResult, modalOpen: true });
    closeModal = () => this.setState({ modalOpen: false });

    renderResult = (result: Result) => {
        return (
            <ListItem
                key={result.start + result.name}
                style={{
                    flexDirection: 'column',
                    marginLeft: 0,
                }}
                onPress={() => this.openModal(result)}
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
            </ListItem>
        );
    }

    render() {
        if (!this.state.results) {
            return null;
        }

        return (
            <React.Fragment>
                <ResultsModal
                    modalOpen={this.state.modalOpen}
                    closeModal={this.closeModal}
                    result={this.state.modalResult}
                    splitControls={this.props.splitControls}
                />

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            onRefresh={async () => {
                                this.setState({ loading: true });
                                await this.poll();
                                this.setState({ loading: false });
                            }}
                            refreshing={this.state.loading}
                            colors={[COLORS.MAIN]}
                            tintColor={COLORS.MAIN}
                        />
                    }
                >
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

                    <View style={{ height: 45 }} />
                </ScrollView>
            </React.Fragment>
        );
    }
}
