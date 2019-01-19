import * as React from 'react';
import {
    Container,
    Spinner,
    List,
    ListItem,
    Text,
    View,
} from 'native-base';
import { NavigationScreenProp } from 'react-navigation';
import { UNIT, COLORS } from '../../../util/const';
import { getComps } from '../../../lib/api';
import { Cache } from '../../../lib/cache';
import { Routes } from '../../../lib/nav/routes';
import Lang from '../../../lib/lang';
import { LanguagePicker } from '../../components/lang/picker';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, ScrollView } from 'react-native';
import { Pagination } from '../../components/pagination';

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    comps: Comp[];
    page: number;
}

export class OLHome extends React.PureComponent<Props, State> {
    static navigationOptions = ({ navigation }) => ({
        title: Lang.print('home.title'),
        headerTitleStyle: {
            color: 'white',
        },
        headerStyle: {
            backgroundColor: COLORS.MAIN,
        },
        headerLeft: (
            <TouchableOpacity
                onPress={() => navigation.push(Routes.info)}
                style={{ marginLeft: UNIT }}
            >
                <Ionicons
                    name="md-information-circle"
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
        ),
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

    renderListItem = (comp: Comp) => (
        <ListItem
            key={comp.id}
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

    renderInner = () => {
        if (!this.state.comps) {
            return <Spinner color={COLORS.MAIN} />;
        }

        const comps = this.groupComps(this.getVisibleComps(this.state.page));

        return (
            <List
                style={{
                    backgroundColor: '#FFF',
                }}
            >
                {
                    Object.keys(comps).map((key) => {
                        return (
                            <View key={key}>
                                <ListItem itemDivider>
                                    <Text style={{
                                        fontSize: UNIT,
                                    }}>
                                        {key} {this.today() === key && Lang.print('home.today')}
                                    </Text>
                                </ListItem>

                                {comps[key].map(this.renderListItem)}
                            </View>
                        );
                    })
                }
                {this.renderPagination()}
            </List>
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
