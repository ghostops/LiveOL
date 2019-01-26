import * as React from 'react';
import * as NB from 'native-base';
import { Cache } from 'lib/cache';
import { getComp, getClasses } from 'lib/api';
import { NavigationScreenProp } from 'react-navigation';
import { Routes } from 'lib/nav/routes';
import { UNIT, COLORS } from 'util/const';
import Lang from 'lib/lang';
import { OLButton } from 'views/components/button';

const {
    Container,
    Content,
    Spinner,
    Card,
    CardItem,
    View,
    Text,
    Body,
    Title,
    ListItem,
    List,
} = NB;

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    comp: Comp;
    classes: Classes[];
}

export class OLCompetition extends React.PureComponent<Props, State> {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })

    cache: Cache<{
        classes: Classes[];
        comp: Comp;
    }> = new Cache(`comp:${this.props.navigation.state.params.id}`, 3600000);

    state = { comp: null, classes: null, passings: false };

    async componentWillMount() {
        const { params: { id } } = this.props.navigation.state;

        let comp;
        let classes;
        const data = await this.cache.get();

        if (!data) {
            comp = await getComp(id);
            classes = await getClasses(id);

            await this.cache.set({ comp, classes });
        } else {
            comp = data.comp;
            classes = data.classes;
        }

        this.setState({ comp, classes });
    }

    renderClass = ({ className }) => {
        return (
            <ListItem
                key={className}
                style={{ marginLeft: 0 }}
                onPress={() => {
                    const { params: { id } } = this.props.navigation.state;
                    this.props.navigation.push(Routes.classes, {
                        id,
                        className,
                        title: className,
                    });
                }}
            >
                <Text style={{
                    fontSize: UNIT,
                }}>
                    {className}
                </Text>
            </ListItem>
        );
    }

    renderInner = () => {
        if (!this.state.comp || !this.state.classes) {
            return <Spinner color={COLORS.MAIN} />;
        }

        return (
            <View style={{ padding: 15 }}>
                <Card>
                    <CardItem header>
                        <Title style={{
                            fontSize: UNIT * 1.15,
                            color: 'black',
                        }}>
                            {this.state.comp.name}
                        </Title>
                    </CardItem>

                    <CardItem>
                        <Body>
                            <Text style={{
                                fontSize: UNIT,
                            }}>
                                {Lang.print('competitions.organizedBy')}:
                                {' '}
                                {this.state.comp.organizer}
                            </Text>
                        </Body>
                    </CardItem>

                    <CardItem footer>
                        <Text style={{
                            fontSize: UNIT * 1.1,
                        }}>
                            {this.state.comp.date}
                        </Text>
                    </CardItem>
                </Card>

                <View style={{
                    marginVertical: 15,
                    flexDirection: 'row',
                }}>
                    <View style={{ flex: 1 }}>
                        <Title style={{
                            textAlign: 'left',
                            fontSize: UNIT * 1.25,
                            color: 'black',
                        }}>
                            {Lang.print('competitions.classes')}
                        </Title>
                    </View>

                    <View>
                        <OLButton
                            small
                            onPress={() => {
                                const { params: { id } } = this.props.navigation.state;

                                this.props.navigation.push(Routes.passings, {
                                    id,
                                    title: this.state.comp.name,
                                });
                            }}
                        >
                            {Lang.print('competitions.lastPassings')}
                        </OLButton>
                    </View>
                </View>

                <List style={{
                    backgroundColor: '#FFF',
                    borderRadius: 4,
                }}>
                    {
                        this.state.classes.length < 1 ?
                        (
                            <Text style={{
                                textAlign: 'center',
                                paddingVertical: 10,
                                fontSize: UNIT,
                            }}>
                                {Lang.print('competitions.noClasses')}
                            </Text>
                        ) : this.state.classes.map(this.renderClass)
                    }
                </List>
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
