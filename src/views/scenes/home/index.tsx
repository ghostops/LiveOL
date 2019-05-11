import * as React from 'react';
import { Cache } from 'lib/cache';
import { getComps } from 'lib/api';
import { LanguagePicker } from 'views/components/lang/picker';
import { NavigationScreenProp } from 'react-navigation';
import { Pagination } from 'views/components/pagination';
import { Right, Left } from './header';
import { Routes } from 'lib/nav/routes';
import { ScrollView } from 'react-native';
import { SearchBar } from 'views/components/search/bar';
import { today } from 'util/date';
import { TodaysCompetitions } from 'views/components/home/today';
import { UNIT, COLORS } from 'util/const';
import * as _ from 'lodash';
import * as NB from 'native-base';
import Lang from 'lib/lang';
import { getVisibleCompetitions, HomeList } from 'views/components/home/list';
import { HomeListItem } from 'views/components/home/listItem';

const {
    Container,
    Spinner,
    List,
    ListItem,
    Text,
    View,
    Button,
} = NB;

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    allCompetitions: Comp[];
    visibleCompetitions: Comp[];
    todaysCompetitions: Comp[];
    isSearching: boolean;
    page: number;
}

export class OLHome extends React.PureComponent<Props, State> {
    static navigationOptions = ({ navigation }) => ({
        title: Lang.print('home.title'),
        headerRight: <Right onPress={() => navigation.push(Routes.info)} />,
        headerLeft: <Left />,
    })

    size = 20;
    content: ScrollView;
    cache: Cache<Comp[]> = new Cache('visibleCompetitions', 60000);

    state: State = {
        allCompetitions: null,
        visibleCompetitions: null,
        todaysCompetitions: null,
        isSearching: false,
        page: 1,
    };

    componentWillMount() {
        this.loadCompetitions();
    }

    loadCompetitions = async () => {
        let allCompetitions = await this.cache.get();

        if (!allCompetitions) {
            allCompetitions = await getComps();
            await this.cache.set(allCompetitions);
        }

        const todaysCompetitions = allCompetitions.filter((competition) => (
            today() === competition.date
        ));

        this.setState({
            allCompetitions,
            todaysCompetitions,
            visibleCompetitions: allCompetitions,
        });
    }

    scrollTo = (y?: number) => {
        if (this.content) {
            this.content.scrollTo({
                animated: !!y,
                x: 0,
                y: y || 0,
            });
        }
    }

    paginateForward = () => {
        this.setState({ page: this.state.page + 1 }, this.scrollTo);
    }

    paginateBackwards = () => {
        this.setState({ page: this.state.page - 1 }, this.scrollTo);
    }

    paginateEnd = () => {
        const lastPage = Math.floor(
            this.state.visibleCompetitions.length /
            this.size,
        );
        this.setState({ page: lastPage }, this.scrollTo);
    }

    paginateBegining = () => {
        this.setState({ page: 1 }, this.scrollTo);
    }

    renderPagination = () => {
        return (
            <Pagination
                lastPageCompetitions={
                    getVisibleCompetitions(
                        this.state.visibleCompetitions,
                        this.state.page + 2,
                        this.size,
                    )
                }
                paginateBackwards={this.paginateBackwards}
                paginateBegining={this.paginateBegining}
                paginateEnd={this.paginateEnd}
                paginateForward={this.paginateForward}
                page={this.state.page}
                size={this.size}
            />
        );
    }

    onCompetitionPress = (comp: Comp) => {
        this.props.navigation.push(Routes.competition, {
            id: comp.id,
            title: comp.name,
        });
    }

    renderInner = () => {
        if (!this.state.visibleCompetitions) {
            return <Spinner color={COLORS.MAIN} />;
        }

        return (
            <View>
                {
                    this.state.page === 1 &&
                    <TodaysCompetitions
                        competitions={this.state.todaysCompetitions}
                        renderListItem={(competition, index, total) => (
                            <HomeListItem
                                competition={competition}
                                index={index}
                                key={competition.id}
                                onCompetitionPress={this.onCompetitionPress}
                                total={total}
                            />
                        )}
                    />
                }

                <HomeList
                    competitions={this.state.visibleCompetitions}
                    onCompetitionPress={this.onCompetitionPress}
                    page={this.state.page}
                    sizePerPage={this.size}
                />

                {this.renderPagination()}
            </View>
        );
    }

    searchbar: SearchBar;
    onSearch = (term: string) => {
        this.setState({
            visibleCompetitions: null,
            isSearching: true,
        });

        setTimeout(
            () => {
                let visibleCompetitions = this.state.allCompetitions;

                visibleCompetitions = visibleCompetitions
                    .filter((comp) => comp.name.toLowerCase()
                    .includes(term.toLowerCase()));

                this.setState({ visibleCompetitions, page: 1 });
                this.scrollTo();
            },
            0,
        );
    }

    onHide = () => this.setState({
        isSearching: false,
        visibleCompetitions: this.state.allCompetitions,
    })

    renderHeader = () => {
        return (
            <React.Fragment>
                <View
                    style={{
                        flexDirection: 'row',
                        flex: 1,
                    }}
                >
                    <LanguagePicker />

                    <View
                        style={{
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingRight: UNIT,
                            flexDirection: 'row',
                        }}
                    >
                        <Button
                            transparent
                            onPress={() => {
                                if (!this.searchbar) return;
                                this.searchbar.showSearch();
                            }}
                        >
                            <Text>
                                {Lang.print('home.search')}
                            </Text>
                        </Button>
                    </View>
                </View>
            </React.Fragment>
        );
    }

    render() {
        return (
            <Container>
                <ScrollView
                    ref={(component) => this.content = component}
                    style={{ flex: 1 }}
                >
                    {this.renderHeader()}

                    {this.renderInner()}
                </ScrollView>

                <SearchBar
                    ref={(ref) => this.searchbar = ref}
                    onSearch={this.onSearch}
                    onHide={this.onHide}
                />
            </Container>
        );
    }
}
