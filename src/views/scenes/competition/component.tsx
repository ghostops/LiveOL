import * as React from 'react';
import { fontPx, px } from 'util/const';
import { OLButton } from 'views/components/button';
import { OLSafeAreaView } from 'views/components/safeArea';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
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

export const OLCompetition: React.SFC<Props> = (props) => {
    const renderClass = ({ item }) => {
        const { className }: Classes = item;

        return (
            <ListItem
                key={className}
                style={{ marginLeft: 0 }}
                onPress={props.goToClass(className)}
            >
                <Text style={{
                    fontSize: fontPx(16),
                }}>
                    {className}
                </Text>
            </ListItem>
        );
    };

    const renderListHeader = () => (
        <>
            <Card style={{ marginTop: px(15) }}>
                <CardItem header>
                    <Title style={{
                        fontSize: fontPx(18),
                        color: 'black',
                    }}>
                        {props.competition.name}
                    </Title>
                </CardItem>

                <CardItem>
                    <Body>
                        <Text style={{
                            fontSize: fontPx(16),
                        }}>
                            {Lang.print('competitions.organizedBy')}:
                            {' '}
                            {props.competition.organizer}
                        </Text>
                    </Body>
                </CardItem>

                <CardItem footer>
                    <Text style={{
                        fontSize: fontPx(16),
                    }}>
                        {props.competition.date}
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
                        onPress={props.goToLastPassings}
                    >
                        {Lang.print('competitions.lastPassings')}
                    </OLButton>
                </View>
            </View>
        </>
    );

    return (
        <OLSafeAreaView>
            <FlatList
                data={props.classes}
                renderItem={renderClass}
                ListEmptyComponent={(
                    <Text style={{
                        textAlign: 'center',
                        paddingVertical: 10,
                        fontSize: fontPx(14),
                    }}>
                        {Lang.print('competitions.noClasses')}
                    </Text>
                )}
                ListHeaderComponent={renderListHeader()}
                keyExtractor={(item: Classes) => item.className}
                ListFooterComponent={<View style={{ height: px(45) }} />}
            />
        </OLSafeAreaView>
    );
};
