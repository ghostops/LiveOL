import * as React from 'react';
import * as NB from 'native-base';
import { UNIT, COLORS, DEFAULT_HEADER } from 'util/const';
import { getClass } from 'lib/api';
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
    olClass: Class;
}

export class OLClasses extends React.PureComponent<Props, State> {
    interval: number;

    static navigationOptions = ({ navigation }) => ({
        ...DEFAULT_HEADER,
        title: `${navigation.state.params.title}`,
        // ToDo: Implement search
        // headerRight: (
        //     <TouchableOpacity
        //         onPress={() => navigation.push(Routes.info)}
        //         style={{ marginRight: UNIT }}
        //     >
        //         <Ionicons
        //             name="md-search"
        //             size={24}
        //             color="white"
        //         />
        //     </TouchableOpacity>
        // ),
    })

    state = { olClass: null };

    cacheId = () => {
        const { params: { id, className } } = this.props.navigation.state;
        return `${id}:${className}`;
    }
    cache: Cache<Class> = new Cache(`class:${this.cacheId()}`, 10000);

    async componentWillMount() {
        const { params: { id, className } } = this.props.navigation.state;
        let olClass: Class = await this.cache.get();

        if (!olClass) {
            olClass = await getClass(id, className);
            await this.cache.set(olClass);
        }

        this.setState({ olClass });
    }

    poll = async (): Promise<Result[]> => {
        const { params: { id, className } } = this.props.navigation.state;
        const olClass = await getClass(id, className);
        return olClass.results;
    }

    renderInner = () => {
        if (!this.state.olClass) {
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
                    {Lang.print('classes.resultsFor')}: {this.state.olClass.className}
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
                    initialResults={this.state.olClass.results}
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
