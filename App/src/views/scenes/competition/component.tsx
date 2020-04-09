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
import _ from 'lodash';

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
                style={{
                    marginLeft: 0,
                    paddingHorizontal: px(15),
                }}
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
        <View>
            <View>
                <View style={{
                    height: 1000,
                    width: 1000,
                    position: 'absolute',
                    top: -1000,
                    left: -100,
                    backgroundColor: COLORS.MAIN,
                }} />

                <View
                    style={{
                        backgroundColor: COLORS.MAIN,
                        zIndex: 1,
                        elevation: 1,
                        paddingVertical: px(15),
                    }}
                >
                    <OLText
                        size={42}
                        font="Rift_Bold"
                        style={{
                            paddingHorizontal: px(15),
                            textAlign: 'center',
                            color: 'white',
                        }}
                    >
                        {props.competition.name}
                    </OLText>
                </View>

                <Svg
                    viewBox="0 0 1440 320"
                    width="720"
                    height="160"
                    style={{
                        top: -px(80),
                        width: '100%',
                        zIndex: 0,
                        elevation: 0,
                    }}
                >
                        <Path fill={COLORS.MAIN} fill-opacity="1" d="M0,224L60,218.7C120,213,240,203,360,202.7C480,203,600,213,720,208C840,203,960,181,1080,181.3C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
                </Svg>
            </View>

            {/* Negative margin for the SVG */}
            <View style={{ marginTop: -px(120) }} />

            <View
                style={{
                    paddingHorizontal: px(20),
                }}
            >
                {
                    props.competition.eventor &&
                    <View
                        style={{
                            flexDirection: 'row',
                        }}
                    >
                        <View
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {
                                props.competition.eventor &&
                                <OLCompetitionClub
                                    name={props.competition.club}
                                    logoUrl={props.competition.clubLogoUrl}
                                    size={_.last(props.competition.clubLogoSizes)}
                                />
                            }
                        </View>

                        <View
                            style={{
                                alignItems: 'flex-end',
                                flex: 1,
                            }}
                        >
                            <OLText
                                size={16}
                                font="Proxima_Nova"
                                style={{ marginBottom: px(15) }}
                            >
                                {Lang.print('competitions.date')}:{' '}
                                {dateToReadable(
                                    new Date(props.competition.date),
                                )}
                            </OLText>

                            <OLText
                                size={16}
                                font="Proxima_Nova"
                                style={{ marginBottom: px(15) }}
                            >
                                {Lang.print('competitions.distance')}: {Lang.print(`distances.${props.competition.distance}`)}
                            </OLText>

                            <OLText
                                font="Proxima_Nova"
                                size={16}
                            >
                                {Lang.print('competitions.signups')}: {props.competition.signups}
                            </OLText>
                        </View>
                    </View>
                }

                <View
                    style={{
                        paddingTop: px(20),
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    
                </View>

                {
                    props.competition.eventor &&
                    !!props.competition.info &&
                    <View
                        style={{
                            backgroundColor: '#3867d6',
                            padding: px(20),
                            borderRadius: 4,
                            marginTop: px(25),
                        }}
                    >
                        <OLText
                            size={26}
                            font="Rift_Bold"
                            style={{
                                color: 'white',
                                paddingBottom: px(10),
                            }}
                        >
                            {Lang.print('competitions.info')}
                        </OLText>

                        <OLText
                            size={14}
                            font="Proxima_Nova"
                            style={{ color: 'white' }}
                        >
                            {props.competition.info}
                        </OLText>
                    </View>
                }
            </View>

            <View style={{
                paddingHorizontal: px(15),
                marginBottom: px(15),
                marginTop: px(25),
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
        </View>
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
                        paddingTop: px(45),
                        fontSize: fontPx(14),
                    }}>
                        {Lang.print('competitions.noClasses')}
                    </Text>
                )}
                ListHeaderComponent={renderListHeader()}
                keyExtractor={(item: Class) => item.id}
                ListFooterComponent={<View style={{ height: px(45) }} />}
            />
        </OLSafeAreaView>
    );
};
