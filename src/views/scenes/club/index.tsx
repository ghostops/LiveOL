import * as React from 'react';
import * as NB from 'native-base';
import { UNIT, COLORS } from 'util/const';
import { getClub } from 'lib/api';
import { Routes } from 'lib/nav/routes';
import { Cache } from 'lib/cache';
import { ResultList } from 'views/components/result/list';
import { NavigationProp } from '@react-navigation/native';
import Lang from 'lib/lang';

const {
    Container,
    Content,
    Spinner,
    View,
    Title,
} = NB;

interface Props {
    navigation: NavigationProp<any, any>;
}

interface State {
    club: Club;
    polling: boolean;
}

const POLL = 15000;

export class OLClub extends React.PureComponent<Props, State> {
    interval: number;

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })

    cacheId = () => {
        // const { params: { id, clubName } } = this.props.navigation.state;
        // return `${id}:${clubName}`;
    }

    cache: Cache<Club> = new Cache(`class:${this.cacheId()}`, POLL - 5000);

    state: State = { club: null, polling: false };

    async componentWillMount() {
        // const { params: { id, clubName } } = this.props.navigation.state;
        // let club: Club = await this.cache.get();

        // if (!club) {
        //     club = await getClub(id, clubName);
        //     await this.cache.set(club);
        // }

        // this.setState({ club });
    }

    poll = async () => {
        // const { params: { id, clubName } } = this.props.navigation.state;

        // const club: Club = await getClub(id, clubName);

        // console.log(club);

        // return club.results;
    }

    renderInner = () => {
        if (!this.state.club) {
            return <Spinner color={COLORS.MAIN} />;
        }

        return (
            <View>

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
                </View>

                <ResultList
                    refetchTimeout={POLL}
                    fetcher={this.poll as any}
                    onResultPress={(result) => {
                        // const { params: { id } } = this.props.navigation.state;

                        // const className = result.class;

                        // this.props.navigation.push(Routes.classes, {
                        //     id,
                        //     className,
                        //     title: className,
                        // });
                    }}
                    // initialResults={this.state.club.results}
                    subtitle="class"
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
