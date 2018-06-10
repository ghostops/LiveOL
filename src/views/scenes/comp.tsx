import * as React from 'react';
import {
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
    Button,
} from 'native-base';
import { UNIT } from 'utils/const';
import { getComp, getClasses } from 'api';

interface State {
    comp: Comp;
    classes: Classes[];
}

export class OLComp extends React.PureComponent<any, State> {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
        headerTitleStyle: {
            color: 'white',
        },
        headerStyle: {
            backgroundColor: '#e86a1e',
        },
        headerTintColor: 'white',
    })

    state = { comp: null, classes: null, passings: false };

    async componentWillMount() {
        const { params: { id } } = this.props.navigation.state;
        
        const comp = await getComp(id);
        const classes = await getClasses(id);

        this.setState({ comp, classes });
    }

    renderClass = ({ className }) => {
        return (
            <ListItem 
                key={className}
                onPress={() => {
                    const { params: { id } } = this.props.navigation.state;
                    this.props.navigation.push('class', {
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
            return <Spinner color="#e86a1e" />;
        }

        return (
            <View style={{ padding: 10 }}>
                <Card>
                    <CardItem header>
                        <Title style={{
                            fontSize: UNIT * 1.15,
                        }}>
                            {this.state.comp.name}
                        </Title>
                    </CardItem>
                    
                    <CardItem>
                        <Body>
                            <Text style={{
                                fontSize: UNIT,
                            }}>
                                Organized by: {this.state.comp.organizer}
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
                        }}>
                            Classes
                        </Title>
                    </View>

                    <View>
                        <Button
                            small
                            info
                            onPress={() => {
                                const { params: { id } } = this.props.navigation.state;

                                this.props.navigation.push('passings', {
                                    id,
                                    title: this.state.comp.name,
                                });
                            }}
                        >
                            <Text style={{
                                fontSize: UNIT,
                            }}>
                                Last Passings
                            </Text>
                        </Button>
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
                                No classes
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
