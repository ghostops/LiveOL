import _ from 'lodash';
import { dateToReadable } from '~/util/date';
import { OLButton } from '~/views/components/button';
import { OLCompetitionClub } from '~/views/components/competition/club';
import { OLCompetitionIOSHeader } from '~/views/components/competition/iosHeader';
import { OLText } from '~/views/components/text';
import { Linking, Platform, TouchableOpacity, View } from 'react-native';
import { px } from '~/util/const';
import { CompetitionInfoBox } from './info';
import { useTranslation } from 'react-i18next';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { useTheme } from '~/hooks/useTheme';
import { Marquee } from '@animatereactnative/marquee';
import { useState } from 'react';

interface Props {
  competition: TRPCQueryOutput['getCompetition']['competition'];
  latestPassings?: TRPCQueryOutput['getCompetitionLastPassings'];
}

export const OLCompetitionHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [marqueeSpeed, setMarqueeSpeed] = useState(0.75);

  return (
    <View>
      {Platform.OS === 'ios' && (
        <OLCompetitionIOSHeader name={props.competition.name} />
      )}

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (marqueeSpeed === 0) {
            setMarqueeSpeed(0.25);
          } else if (marqueeSpeed === 0.25) {
            setMarqueeSpeed(0.75);
          } else {
            setMarqueeSpeed(0);
          }
        }}
      >
        <Marquee
          speed={marqueeSpeed}
          style={{
            backgroundColor: colors.GREEN,
            paddingVertical: px(8),
          }}
        >
          <OLText size={16} style={{ color: 'white' }}>
            {props.latestPassings
              ?.map(result => {
                return `${result.runnerName} (${result.class}): ${result.time} ${result.controlName} -- `;
              })
              .join('')}
          </OLText>
        </Marquee>
      </TouchableOpacity>

      {props.competition.eventorAvailable && props.competition.canceled && (
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
            size={18}
            style={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            {t('competitions.canceled')}
          </OLText>
        </View>
      )}

      <View
        style={{
          paddingHorizontal: px(20),
        }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: px(10),
          }}
        >
          {props.competition.eventorAvailable && (
            <View
              style={{
                alignItems: 'center',
                paddingBottom: px(25),
              }}
            >
              {props.competition.eventorAvailable && (
                <OLCompetitionClub
                  name={props.competition.club || ''}
                  logoUrl={props.competition.clubLogoUrl}
                  size={_.last(props.competition.clubLogoSizes)}
                />
              )}
            </View>
          )}

          <OLText size={16} style={{ marginBottom: px(15) }}>
            {t('competitions.date')}: {dateToReadable(props.competition.date)}
          </OLText>

          <OLText size={16} style={{ marginBottom: px(15) }}>
            {t('competitions.organizedBy')}: {props.competition.organizer}
          </OLText>

          {props.competition.eventorAvailable && (
            <>
              <OLText size={16} style={{ marginBottom: px(15) }}>
                {t('competitions.distance')}:{' '}
                {t(`distances.${props.competition.distance}`)}
              </OLText>

              <OLText style={{ marginBottom: px(15) }} size={16}>
                {t('competitions.signups')}: {props.competition.signups}
              </OLText>

              <OLButton
                small
                onPress={() =>
                  props.competition.eventorUrl &&
                  Linking.openURL(props.competition.eventorUrl)
                }
                style={{
                  alignSelf: 'flex-start',
                  marginBottom: px(15),
                  backgroundColor: colors.BLACK,
                }}
              >
                {t('competitions.visitEventor')}
              </OLButton>
            </>
          )}
        </View>

        {props.competition.eventorAvailable && !!props.competition.info && (
          <CompetitionInfoBox infoHtml={props.competition.info} />
        )}
      </View>

      <OLText
        size={22}
        style={{
          textAlign: 'left',
          color: 'black',
          marginLeft: px(16),
          marginVertical: px(16),
        }}
      >
        {t('competitions.classes')}
      </OLText>
    </View>
  );
};
