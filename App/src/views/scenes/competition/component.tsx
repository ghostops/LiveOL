import * as React from 'react';
import { Class } from 'lib/graphql/fragments/types/Class';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { EventorCompetitionFragment } from 'lib/graphql/fragments/types/EventorCompetitionFragment';
import { dateToReadable } from 'util/date';
import { fontPx, px, COLORS, WINDOW_WIDTH } from 'util/const';
import { Lang } from 'lib/lang';
import { OLButton } from 'views/components/button';
import { OLLoading } from 'views/components/loading';
import { OLSafeAreaView } from 'views/components/safeArea';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import * as NB from 'native-base';
import { OLCompetitionClub } from 'views/components/competition/club';
import { OLText } from 'views/components/text';
import { Svg, Path } from 'react-native-svg';

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
    competition: Competition & EventorCompetitionFragment;
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
            <View>
                <>
                    <View style={{
                        height: 1000,
                        width: 1000,
                        position: 'absolute',
                        top: -1000,
                        left: -100,
                        backgroundColor: COLORS.MAIN,
                    }} />
                    <Svg
                        viewBox="0 0 1440 320"
                        width="720"
                        height="160"
                        style={{
                            position: 'absolute',
                            left: -px(15),
                            top: -px(20),
                            right: 0,
                        }}
                    >
                            <Path fill={COLORS.MAIN} fill-opacity="1" d="M0,224L60,218.7C120,213,240,203,360,202.7C480,203,600,213,720,208C840,203,960,181,1080,181.3C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
                    </Svg>
                </>

                <OLText
                    size={46}
                    font="Rift_Bold"
                    style={{
                        textAlign: 'center',
                        color: 'white',
                    }}
                >
                    {props.competition.name}
                </OLText>

                <View
                    style={{
                        paddingTop: px(65),
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <OLText
                        size={16}
                        font="Proxima_Nova_Bold"
                    >
                        {Lang.print(`distances.${props.competition.distance}`)}
                    </OLText>

                    <OLText
                        font="Proxima_Nova"
                        size={16}
                    >
                        543 {Lang.print('competitions.signups')}
                    </OLText>
                </View>

                <View
                    style={{
                        paddingTop: px(20),
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <OLCompetitionClub
                        clubName={props.competition.club}
                    />

                    <OLText
                        size={16}
                        font="Proxima_Nova_Bold"
                    >
                        {dateToReadable(
                            new Date(props.competition.date),
                        )}
                    </OLText>
                </View>
            </View>

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
