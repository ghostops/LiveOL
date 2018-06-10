import * as React from 'react';
import {
    Container,
    Content,
    Spinner,
    List,
    ListItem,
    Text,
    View,
} from 'native-base';
import { UNIT } from 'utils/const';
import { getComps } from 'api';

interface State {
    comps: Comp[];
}

export class OLList extends React.PureComponent<any, State> {
    static navigationOptions = ({ navigation }) => ({
        title: 'Competitions',
        headerTitleStyle: {
            color: 'white',
        },
        headerStyle: {
            backgroundColor: '#e86a1e',
        },
    })

    state = {
        comps: null,
    };

    async componentDidMount() {
        const comps = await getComps();
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
      
        const output = d.getFullYear() + '-' +
            (month < 10 ? '0' : '') + month + '-' +
            (day < 10 ? '0' : '') + day;
      
        return output;
    }

    renderListItem = (comp: Comp) => (
        <ListItem 
            key={comp.id}
            onPress={() => {
                this.props.navigation.push('comp', {
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

    renderInner = () => {
        if (!this.state.comps) {
            return <Spinner color="#e86a1e" />;
        }

        const comps = this.groupComps(this.state.comps);

        return (
            <List style={{
                backgroundColor: '#FFF',
            }}>
                {
                    Object.keys(comps).map((key) => {
                        return (
                            <View key={key}>
                                <ListItem itemDivider>
                                    <Text style={{
                                        fontSize: UNIT,
                                    }}>
                                        {key} {this.today() === key && ' (Today)'}
                                    </Text>
                                </ListItem>

                                {comps[key].map(this.renderListItem)}
                            </View>
                        );
                    })
                }
            </List>
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
