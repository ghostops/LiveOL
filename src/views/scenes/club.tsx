import * as React from 'react';
import {
    Container,
    Content,
    Spinner,
    View,
    Text,
    Title,
    ListItem,
    List,
    Badge,
    Switch,
    Card,
    CardItem,
} from 'native-base';
import { UNIT } from 'utils/const';
import { TouchableOpacity } from 'react-native';
import { getClub } from 'api';

interface State {
    club: Club;
    polling: boolean;
}

export class OLClub extends React.PureComponent<any, State> {
    interval: number;

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

    state = { club: null, polling: false };

    componentWillMount() {
        this.poll();
    }

    componentDidMount() {
        this.startPoll();
    }

    componentWillUnmount() {
        this.clearPoll();
    }

    componentDidUpdate(prevProps, prevState: State) {
        if (this.state.polling !== prevState.polling) {
            if (this.state.polling) {
                this.poll();
                this.startPoll();
            } else {
                this.clearPoll();
            }
        }
    }

    poll = async () => {
        const { params: { id, clubName } } = this.props.navigation.state;
        
        const club = await getClub(id, clubName);

        this.setState({ club });
    }

    startPoll = () => this.interval = setInterval(this.poll, 15000);
    clearPoll = () => this.interval && clearInterval(this.interval);

    renderResult = (result: Result) => {
        return (
            <ListItem 
                key={result.start + result.name}
                style={{
                    flexDirection: 'column',
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                }}>
                    <View style={{
                        paddingRight: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {
                            result.place.length > 0 &&
                            result.place !== '-' &&
                            <Badge style={{ backgroundColor: '#e86a1e' }}>
                                <Text style={{
                                    fontSize: UNIT,
                                }}>
                                    {result.place}
                                </Text>
                            </Badge>
                        }
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <Text style={{
                                textAlign: 'left',
                                flex: 1,
                                fontSize: UNIT,
                            }}>
                                {result.name}
                            </Text>
                            <Text style={{
                                marginLeft: 10,
                                fontSize: UNIT * 1.35,
                            }}>
                                {result.result}
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <TouchableOpacity onPress={() => {
                                const { params: { id } } = this.props.navigation.state;
                                this.props.navigation.push(
                                    'class',
                                    { 
                                        id,
                                        className: result.class,
                                        title: result.class,
                                    },
                                );
                            }} style={{
                                flex: 1,
                            }}>
                                <Text style={{
                                    color: '#428bca',
                                    fontSize: UNIT,
                                }}>
                                    {result.class}
                                </Text>
                            </TouchableOpacity>

                            <Text style={{
                                fontSize: UNIT,
                            }}>
                                {result.timeplus}
                            </Text>
                        </View>
                    </View>
                </View>
            </ListItem>
        );
    }

    renderInner = () => {
        if (!this.state.club) {
            return <Spinner color="#e86a1e" />;
        }

        return (
            <View style={{
                padding: 10,
            }}>

                <Title style={{ 
                    textAlign: 'left',
                    fontSize: UNIT * 1.35,
                    marginVertical: 10,
                }}>
                    Results for: {this.state.club.clubName}
                </Title>

                <Card style={{ marginBottom: 10 }}>
                    <CardItem style={{ paddingVertical: 8 }}>
                        <Text style={{
                            flex: 1,
                            fontSize: UNIT,
                        }}>
                            Turn on live updating results:
                        </Text>

                        <Switch
                            value={this.state.polling}
                            onTintColor="#e86a1e"
                            onValueChange={(polling) => this.setState({ polling })}
                        />
                    </CardItem>
                </Card>

                <List style={{
                    backgroundColor: '#FFF',
                    borderRadius: 4,
                }}>
                    {
                        this.state.club.results.length < 1 ? 
                        (
                            <Text style={{ 
                                textAlign: 'center', 
                                paddingVertical: 10, 
                                fontSize: UNIT,
                            }}>
                                No classes
                            </Text>
                        ) : this.state.club.results.map(this.renderResult)
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
