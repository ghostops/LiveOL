import * as React from 'react';
import {  } from 'react-native';
import {
    View,
    Spinner,
    Text,
    List,
    ListItem,
} from 'native-base';
import { getPasses } from 'api';

interface State {
    passings: Passing[];
}

export class OLPassings extends React.PureComponent<any, State> {
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
    
    state = {
        passings: null,
    };

    componentWillMount() {
        this.getPasses();
    }

    getPasses = async () => {
        const { params: { id } } = this.props.navigation.state;
        const passings = await getPasses(id);

        this.setState({ passings });
    }

    renderResult = (passing: Passing) => {
        return (
            <ListItem 
                key={passing.time + passing.runnerName}
                style={{
                    flexDirection: 'column',
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                }}>
                    <View style={{ flex: 1 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <Text style={{ textAlign: 'left', flex: 1 }}>{passing.class}</Text>
                            <Text style={{ marginLeft: 10, fontSize: 22 }}>
                                {passing.runnerName}
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flex: 1,
                        }}>
                            <Text>{passing.passtime}</Text>
                        </View>
                    </View>
                </View>
            </ListItem>
        );
    }

    renderInner = () => {
        return (
            <List>
                {this.state.passings.map(this.renderResult)}
            </List>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {
                    this.state.passings
                    ? this.renderInner()
                    : <Spinner color="#e86a1e" />
                }
            </View>
        );
    }
}
