import * as React from 'react';
import { Class } from 'lib/graphql/fragments/types/Class';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { dateToReadable } from 'util/date';
import { fontPx, px } from 'util/const';
import { Lang } from 'lib/lang';
import { OLButton } from 'views/components/button';
import { OLLoading } from 'views/components/loading';
import { OLSafeAreaView } from 'views/components/safeArea';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import * as NB from 'native-base';

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
    loading: boolean;
    competition: Competition;
    classes: Class[] | null;
    goToLastPassings: () => void;
    goToClass: (name: string) => () => void;
}

export const OLCompetition: React.SFC<Props> = (props) => {
    const renderClass = ({ item }) => {
        const { name }: Class = item;

        return (
            <ListItem
                key={name}
                style={{ marginLeft: 0 }}
                onPress={props.goToClass(name)}
            >
                <Text style={{
                    fontSize: fontPx(16),
                }}>
                    {name}
                </Text>
            </ListItem>
        );
    };

    const renderListHeader = () => (
        <>
            <Card>
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
                        {dateToReadable(
                            new Date(props.competition.date),
                        )}
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

    if (props.loading) {
        return <OLLoading />;
    }

    return (
        <OLSafeAreaView>
            <FlatList
                data={props.classes}
                renderItem={renderClass}
                ListEmptyComponent={(
                    <Text style={{
                        textAlign: 'center',
                        paddingVertical: px(10),
                        paddingTop: px(45),
                        fontSize: fontPx(14),
                    }}>
                        {Lang.print('competitions.noClasses')}
                    </Text>
                )}
                ListHeaderComponent={renderListHeader()}
                keyExtractor={(item: Class) => item.id}
                ListFooterComponent={<View style={{ height: px(45) }} />}
                style={{ padding: px(15) }}
            />
        </OLSafeAreaView>
    );
};
