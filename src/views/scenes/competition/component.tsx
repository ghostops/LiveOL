import * as React from 'react';
import { OLButton } from 'views/components/button';
import { fontPx } from 'util/const';
import * as NB from 'native-base';
import Lang from 'lib/lang';

const {
    Container,
    Content,
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
    competition: Comp;
    classes: Classes[] | null;
    goToLastPassings: () => void;
    goToClass: (name: string) => () => void;
}

export class OLCompetition extends React.PureComponent<Props> {
    renderClass = ({ className }) => {
        return (
            <ListItem
                key={className}
                style={{ marginLeft: 0 }}
                onPress={this.props.goToClass(className)}
            >
                <Text style={{
                    fontSize: fontPx(16),
                }}>
                    {className}
                </Text>
            </ListItem>
        );
    }

    renderInner = () => {
        return (
            <View style={{ padding: 15 }}>
                <Card>
                    <CardItem header>
                        <Title style={{
                            fontSize: fontPx(18),
                            color: 'black',
                        }}>
                            {this.props.competition.name}
                        </Title>
                    </CardItem>

                    <CardItem>
                        <Body>
                            <Text style={{
                                fontSize: fontPx(16),
                            }}>
                                {Lang.print('competitions.organizedBy')}:
                                {' '}
                                {this.props.competition.organizer}
                            </Text>
                        </Body>
                    </CardItem>

                    <CardItem footer>
                        <Text style={{
                            fontSize: fontPx(16),
                        }}>
                            {this.props.competition.date}
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
                            fontSize: fontPx(20),
                            color: 'black',
                        }}>
                            {Lang.print('competitions.classes')}
                        </Title>
                    </View>

                    <View>
                        <OLButton
                            small
                            onPress={this.props.goToLastPassings}
                        >
                            {Lang.print('competitions.lastPassings')}
                        </OLButton>
                    </View>
                </View>

                {
                    !!this.props.classes &&
                    <List style={{
                        backgroundColor: '#FFF',
                        borderRadius: 4,
                    }}>
                        {
                            this.props.classes.length < 1 ?
                            (
                                <Text style={{
                                    textAlign: 'center',
                                    paddingVertical: 10,
                                    fontSize: fontPx(14),
                                }}>
                                    {Lang.print('competitions.noClasses')}
                                </Text>
                            ) : this.props.classes.map(this.renderClass)
                        }
                    </List>
                }
            </View>
        );
    }

    render() {
        return this.renderInner();
    }
}
