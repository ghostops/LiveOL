import * as React from 'react';
import * as NB from 'native-base';
import { UNIT, COLORS } from 'util/const';
import { getClub } from 'lib/api';
import { Routes } from 'lib/nav/routes';
import { Cache } from 'lib/cache';
import { ResultList } from 'views/components/result/list';
import { NavigationScreenProp } from 'react-navigation';
import Lang from 'lib/lang';

const {
    Container,
    Content,
    Spinner,
    View,
    Title,
} = NB;

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    club: Club;
    polling: boolean;
}

export class OLClub extends React.PureComponent<Props, State> {
    interval: number;

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })

    cacheId = () => {
        const { params: { id, clubName } } = this.props.navigation.state;
        return `${id}:${clubName}`;
    }

    cache: Cache<Club> = new Cache(`class:${this.cacheId()}`, 10000);

    state: State = { club: null, polling: false };

    async componentWillMount() {
        const { params: { id, clubName } } = this.props.navigation.state;
        let club: Club = await this.cache.get();

        if (!club) {
            club = await getClub(id, clubName);
            await this.cache.set(club);
        }

        this.setState({ club });
    }

    poll = async () => {
        const { params: { id, clubName } } = this.props.navigation.state;

        const club: Club = await getClub(id, clubName);

        return club.results;
    }

    renderInner = () => {
        if (!this.state.club) {
            return <Spinner color={COLORS.MAIN} />;
        }

        return (
            <View style={{
                padding: 10,
            }}>

                <Title style={{
                    textAlign: 'left',
                    fontSize: UNIT * 1.35,
                    marginVertical: 10,
                    color: 'black',
                }}>
                    {Lang.print('classes.resultsFor')}: {this.state.club.clubName}
                </Title>

                <ResultList
                    fetcher={this.poll}
                    onResultPress={(result) => {
                        const { params: { id } } = this.props.navigation.state;
                        this.props.navigation.push(Routes.club, {
                            id,
                            clubName: result.club,
                            title: result.club,
                        });
                    }}
                    initialResults={this.state.club.results}
                />
            </View>
        );
    }

    render() {
        return (
            <Container>
                <Content>
                    {this.renderInner()}
                </Content>
            </Container>
        );
    }
}
