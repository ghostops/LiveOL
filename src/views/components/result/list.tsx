import * as React from 'react';
import _ from 'lodash';
import { RadioResultsPromotion } from '../promotion/radioResults';
import { ResultBox } from './result';
import { ScrollView, RefreshControl } from 'react-native';
import { UNIT, COLORS } from 'util/const';
import * as NB from 'native-base';
import Lang from 'lib/lang';

const {
    View,
    Text,
    List,
    Switch,
    Card,
    CardItem,
} = NB;

interface Props {
    fetcher: () => Promise<Result[]>;
    onResultPress: (result: Result) => void;
    search?: (results: Result[]) => Result[];
    subtitle?: 'class' | 'club';
    refetchTimeout: number;
}

interface State {
    results: Result[];
    polling: boolean;
    loading: boolean;
}

export class ResultList extends React.PureComponent<Props, State> {
    static defaultProps: Partial<Props> = {
        subtitle: 'class',
    };

    interval: NodeJS.Timeout;
    state: State = {
        results: null,
        polling: false,
        loading: false,
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

    startPoll = () => this.interval = setInterval(this.poll, this.props.refetchTimeout);
    clearPoll = () => this.interval && clearInterval(this.interval);

    renderResult = (result: Result) => {
        return (
            <ResultBox
                key={result.start + result.name}
                result={result}
                onResultPress={this.props.onResultPress}
                subtitle={this.props.subtitle}
            />
        );
    }

    render() {
        if (!this.state.results) {
            return null;
        }

        return (
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
                <RadioResultsPromotion />

                <View
                    style={{
                        paddingHorizontal: 10,
                    }}
                >
                    <Card style={{
                        marginBottom: 10,
                    }}>
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
                </View>

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
        );
    }
}
