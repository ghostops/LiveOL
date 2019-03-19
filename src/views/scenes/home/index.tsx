import * as React from 'react';
import * as NB from 'native-base';
import { Cache } from 'lib/cache';
import { getComps } from 'lib/api';
import { LanguagePicker } from 'views/components/lang/picker';
import { NavigationScreenProp } from 'react-navigation';
import { Pagination } from 'views/components/pagination';
import { Right, Left } from './header';
import { Routes } from 'lib/nav/routes';
import { ScrollView, LayoutChangeEvent, Alert } from 'react-native';
import { UNIT, COLORS } from 'util/const';
import Lang from 'lib/lang';
import { SearchBar } from 'views/components/search/bar';

const {
    Container,
    Spinner,
    List,
    ListItem,
    Text,
    View,
    CardItem,
    Card,
    Body,
    Header,
    Item,
    Button,
    Icon,
    Input,
} = NB;

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    originalComps: Comp[];
    comps: Comp[];
    page: number;
    todayOffset: number;
}

export class OLHome extends React.PureComponent<Props, State> {
    static navigationOptions = ({ navigation }) => ({
        title: Lang.print('home.title'),
        headerRight: <Right onPress={() => navigation.push(Routes.info)} />,
        headerLeft: <Left />,
    })

    size = 20;
    content: ScrollView;
    cache: Cache<Comp[]> = new Cache('comps', 60000);

    state: State = {
        originalComps: null,
        comps: null,
        page: 1,
        todayOffset: null,
    };

    async componentWillMount() {
        let comps = await this.cache.get();

        if (!comps) {
            comps = await getComps();
            await this.cache.set(comps);
        }

        this.setState({
            comps,
            originalComps: comps,
        });
    }

    componentDidMount() {
        // setTimeout(this.toggleSearch, 2000);
    }

    groupComps = (comps: Comp[]) => {
        const uniqEs6 = (arrArg) => (
            arrArg.filter((elem, pos, arr) => {
                return arr.indexOf(elem) === pos;
            })
        );

        const keys = uniqEs6(comps.map((comp) => comp.date));
        const map = {};

        for (const key of keys) {
            map[key] = [];
        }

        for (const comp of comps) {
            map[comp.date].push(comp);
        }

        return map;
    }

    today = () => {
        const d = new Date();

        const month = d.getMonth() + 1;
        const day = d.getDate();

        // tslint:disable
        const output = d.getFullYear() + '-' +
            (month < 10 ? '0' : '') + month + '-' +
            (day < 10 ? '0' : '') + day;
        // tslint:enable

        return output;
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
            this.state.comps.length /
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
                lastPageComps={this.getVisibleComps(this.state.page + 2)}
                paginateBackwards={this.paginateBackwards}
                paginateBegining={this.paginateBegining}
                paginateEnd={this.paginateEnd}
                paginateForward={this.paginateForward}
                page={this.state.page}
                size={this.size}
            />
        );
    }

    getVisibleComps = (page: number) =>
        this.state.comps.slice(
            this.size * (page === 1 ? 0 : (page || 1)),
            (this.size * (page || 1)) + this.size,
        )

    renderListSection = (key: string, comps: any) => {
        return (
            <View key={key}>
                <ListItem
                    itemDivider
                    style={{
                        marginLeft: 0,
                        paddingHorizontal: UNIT,
                    }}
                >
                    <Text style={{
                        fontSize: UNIT,
                        fontWeight: 'bold',
                    }}>
                        {key}
                    </Text>
                </ListItem>

                <List>
                    {comps[key].map(this.renderListItem)}
                </List>
            </View>
        );
    }

    renderListItem = (comp: Comp, index?: number, total?: number) => (
        <ListItem
            key={comp.id}
            style={{
                marginLeft: 0,
                paddingHorizontal: UNIT,
                width: '100%',
                borderBottomWidth: index === total - 1 ? 0 : 1,
            }}
            onPress={() => {
                this.props.navigation.push(Routes.competition, {
                    id: comp.id,
                    title: comp.name,
                });
            }}
        >
            <Text style={{
                fontSize: UNIT,
            }}>
                {comp.name}
            </Text>
        </ListItem>
    )

    todayLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        this.setState({ todayOffset: layout.y });
    }

    renderToday = (key: string, comps: any) => {
        return (
            <View
                key="today"
                style={{
                    padding: UNIT,
                    backgroundColor: COLORS.MAIN,
                }}
                onLayout={this.todayLayout}
            >

                <Text
                    style={{
                        fontSize: UNIT * 1.5,
                        textAlign: 'center',
                        color: 'white',
                    }}
                >
                    {Lang.print('home.today')}
                </Text>

                <Text
                    style={{
                        fontSize: UNIT,
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    {key}
                </Text>

                <Card style={{
                    marginTop: UNIT,
                    width: '100%',
                }}>
                    <CardItem>
                        <Body style={{ width: '100%' }}>
                            <List style={{ width: '100%' }}>
                                {
                                    comps[key].map(
                                        (comp, index) =>
                                            this.renderListItem(
                                                comp,
                                                index,
                                                comps[key].length,
                                            ),
                                    )
                                }
                            </List>
                        </Body>
                    </CardItem>
                </Card>
            </View>
        );
    }

    renderInner = () => {
        if (!this.state.comps) {
            return <Spinner color={COLORS.MAIN} />;
        }

        const comps = this.groupComps(this.getVisibleComps(this.state.page));

        return (
            <View>
                {
                    Object.keys(comps).map((key) => {
                        return (
                            this.today() === key
                            ? this.renderToday(key, comps)
                            : this.renderListSection(key, comps)
                        );
                    })
                }
                {this.renderPagination()}
            </View>
        );
    }

    searchbar: SearchBar;
    onSearch = (term: string) => {
        let comps = this.state.originalComps;

        comps = comps.filter((comp) => comp.name.toLowerCase().includes(term.toLowerCase()));

        this.setState({ comps });
        this.scrollTo();
    }

    scrollToday = () => {
        const today = this.state.originalComps.find((comp) => this.today() === comp.date);

        if (!today) {
            return Alert.alert(Lang.print('home.nothingToday'));
        }

        if (!this.state.todayOffset) {
            this.paginateForward();
            setTimeout(this.scrollToday, 650);
        } else {
            this.scrollTo(this.state.todayOffset);
        }
    }

    render() {
        return (
            <Container>
                <ScrollView
                    ref={(component) => this.content = component}
                    style={{ flex: 1 }}
                >
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

                    <View
                        style={{
                            margin: 10,
                        }}
                    >
                        <Button
                            success
                            full
                            rounded
                            small
                            onPress={this.scrollToday}
                        >
                            <Text>
                                {Lang.print('home.goToday')}
                            </Text>
                        </Button>
                    </View>

                    {this.renderInner()}
                </ScrollView>

                <SearchBar
                    ref={(ref) => this.searchbar = ref}
                    onSearch={this.onSearch}
                />
            </Container>
        );
    }
}
