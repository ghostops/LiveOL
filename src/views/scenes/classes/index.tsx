import * as React from 'react';
import * as NB from 'native-base';
import { UNIT, COLORS } from 'util/const';
import { getClass } from 'lib/api';
import { Routes } from 'lib/nav/routes';
import { Cache } from 'lib/cache';
import { ResultList } from 'views/components/result/list';
import { NavigationScreenProp } from 'react-navigation';
import Lang from 'lib/lang';

const {
    Container,
    Spinner,
    View,
    Title,
} = NB;

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    olClass: Class;
}

const POLL = 15000;

export class OLClasses extends React.PureComponent<Props, State> {
    interval: number;

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })

    state: State = { olClass: null };

    cacheId = () => {
        const { params: { id, className } } = this.props.navigation.state;
        return `class:${id}:${className}`;
    }

    // 1000 ms less than the poller
    cache: Cache<Class> = new Cache(`class:${this.cacheId()}`, POLL - 1000);

    async componentWillMount() {
        this.poll();
    }

    poll = async (): Promise<Result[]> => {
        const { params: { id, className } } = this.props.navigation.state;

        let olClass: Class = await this.cache.get();

        if (!olClass) {
            olClass = await getClass(id, className);
            await this.cache.set(olClass);
        }

        this.setState({ olClass });

        return olClass.results;
    }

    renderInner = () => {
        if (!this.state.olClass) {
            return <Spinner color={COLORS.MAIN} />;
        }

        return (
            <View>
                <View
                    style={{
                        paddingTop: 10,
                        paddingHorizontal: 10,
                    }}
                >
                    <Title style={{
                        textAlign: 'left',
                        fontSize: UNIT * 1.35,
                        paddingBottom: 10,
                        color: 'black',
                    }}>
                        {Lang.print('classes.resultsFor')}: {this.state.olClass.className}
                    </Title>
                </View>

                <ResultList
                    refetchTimeout={POLL}
                    fetcher={this.poll}
                    onResultPress={(result) => {
                        const { params: { id } } = this.props.navigation.state;
                        this.props.navigation.push(Routes.club, {
                            id,
                            clubName: result.club,
                            title: result.club,
                        });
                    }}
                    initialResults={this.state.olClass.results}
                    splitControls={this.state.olClass.splitcontrols}
                    subtitle="club"
                />
            </View>
        );
    }

    render() {
        return (
            <Container>
                {this.renderInner()}
            </Container>
        );
    }
}
