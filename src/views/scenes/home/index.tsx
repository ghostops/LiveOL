import * as React from 'react';
import * as NB from 'native-base';
import { Cache } from 'lib/cache';
import { getComps } from 'lib/api';
import { LanguagePicker } from 'views/components/lang/picker';
import { NavigationScreenProp } from 'react-navigation';
import { Pagination } from 'views/components/pagination';
import { Right, Left } from './header';
import { Routes } from 'lib/nav/routes';
import { ScrollView } from 'react-native';
import { UNIT, COLORS, DEFAULT_HEADER } from 'util/const';
import Lang from 'lib/lang';

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
} = NB;

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    comps: Comp[];
    page: number;
}

export class OLHome extends React.PureComponent<Props, State> {
    static navigationOptions = ({ navigation }) => ({
        ...DEFAULT_HEADER,
        title: Lang.print('home.title'),
        headerRight: <Right onPress={() => navigation.push(Routes.info)} />,
        headerLeft: <Left />,
    })

    size = 20;
    content: ScrollView;
    cache: Cache<Comp[]> = new Cache('comps', 60000);

    state: State = {
        comps: null,
        page: 1,
    };

    async componentWillMount() {
        let comps = await this.cache.get();

        if (!comps) {
            comps = await getComps();
            await this.cache.set(comps);
        }

        this.setState({ comps });
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

    scrollTop = () => {
        if (this.content) {
            this.content.scrollTo({
                animated: false,
                x: 0,
                y: 0,
            });
        }
    }

    paginateForward = () => {
        this.setState({ page: this.state.page + 1 }, this.scrollTop);
    }

    paginateBackwards = () => {
        this.setState({ page: this.state.page - 1 }, this.scrollTop);
    }

    paginateEnd = () => {
        const lastPage = Math.floor(
            this.state.comps.length /
            this.size,
        );
        this.setState({ page: lastPage }, this.scrollTop);
    }

    paginateBegining = () => {
        this.setState({ page: 1 }, this.scrollTop);
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

    renderListItem = (comp: Comp) => (
        <ListItem
            key={comp.id}
            style={{
                marginLeft: 0,
                paddingHorizontal: UNIT,
                width: '100%',
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

    renderToday = (key: string, comps: any) => {
        return (
            <View
                key="today"
                style={{
                    padding: UNIT,
                    backgroundColor: COLORS.MAIN,
                }}
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

                <Card style={{ marginTop: UNIT }}>
                    <CardItem>
                        <Body style={{ width: '100%' }}>
                            <List>
                                {comps[key].map(this.renderListItem)}
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

    render() {
        return (
            <Container>
                <ScrollView
                    ref={(component) => this.content = component}
                    style={{ flex: 1 }}
                >
                    <LanguagePicker />
                    {this.renderInner()}
                </ScrollView>
            </Container>
        );
    }
}
