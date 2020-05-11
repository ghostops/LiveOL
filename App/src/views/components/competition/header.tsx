import * as React from 'react';
import _ from 'lodash';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { dateToReadable } from 'util/date';
import { EventorCompetitionFragment } from 'lib/graphql/fragments/types/EventorCompetitionFragment';
import { Lang } from 'lib/lang';
import { OLButton } from 'views/components/button';
import { OLCompetitionClub } from 'views/components/competition/club';
import { OLCompetitionIOSHeader } from 'views/components/competition/iosHeader';
import { OLText } from 'views/components/text';
import { Platform } from 'react-native';
import { px } from 'util/const';
import { View } from 'native-base';

interface Props {
    competition: Competition & EventorCompetitionFragment;
    goToLastPassings: () => void;
}

export const OLCompetitionHeader: React.SFC<Props> = (props) => (
    <View>
        {Platform.OS === 'ios' && <OLCompetitionIOSHeader name={props.competition.name} />}
        {Platform.OS === 'android' && <View style={{ height: px(30) }} />}

        {
            props.competition.eventor &&
            props.competition.canceled &&
            <View
                style={{
                    borderTopColor: '#b81c1c',
                    borderTopWidth: 4,
                    backgroundColor: '#ff3838',
                    padding: px(10),
                    top: Platform.OS === 'ios' ? -px(35) : -px(30),
                }}
            >
                <OLText
                    font="Proxima_Nova_Bold"
                    size={18}
                    style={{
                        textAlign: 'center',
                        color: 'white',
                    }}
                >
                    {Lang.print('competitions.canceled')}
                </OLText>
            </View>
        }

        <View
            style={{
                paddingHorizontal: px(20),
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                }}
            >
                {
                    props.competition.eventor &&
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
                }

                <View
                    style={{
                        paddingTop: px(15),
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
                        {dateToReadable(props.competition.date)}
                    </OLText>

                    <OLText
                        size={16}
                        font="Proxima_Nova"
                        style={{ marginBottom: px(15) }}
                    >
                        {Lang.print('competitions.organizedBy')}:{' '}
                        {props.competition.organizer}
                    </OLText>

                    {
                        props.competition.eventor &&
                        <>
                            <OLText
                                size={16}
                                font="Proxima_Nova"
                                style={{ marginBottom: px(15) }}
                            >
                                {Lang.print('competitions.distance')}:{' '}
                                {Lang.print(`distances.${props.competition.distance}`)}
                            </OLText>

                            <OLText
                                font="Proxima_Nova"
                                style={{ marginBottom: px(15) }}
                                size={16}
                            >
                                {Lang.print('competitions.signups')}:{' '}
                                {props.competition.signups}
                            </OLText>
                        </>
                    }
                </View>
            </View>

            {
                props.competition.eventor &&
                !!props.competition.info &&
                <View
                    style={{
                        backgroundColor: '#3867d6',
                        padding: px(20),
                        borderRadius: 4,
                        marginTop: px(5),
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
                        selectable
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
                <OLText
                    font="Proxima_Nova_Bold"
                    size={20}
                    style={{
                        textAlign: 'left',
                        color: 'black',
                    }}
                >
                    {Lang.print('competitions.classes')}
                </OLText>
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
