import React from 'react';
import _ from 'lodash';
import { dateToReadable } from 'util/date';
import { OLButton } from 'views/components/button';
import { OLCompetitionClub } from 'views/components/competition/club';
import { OLCompetitionIOSHeader } from 'views/components/competition/iosHeader';
import { OLText } from 'views/components/text';
import { Platform, View } from 'react-native';
import { px } from 'util/const';
import { CompetitionInfoBox } from './info';
import { useTranslation } from 'react-i18next';
import { OlCompetition } from 'lib/graphql/generated/types';

interface Props {
  competition: OlCompetition;
  goToLastPassings: () => void;
}

export const OLCompetitionHeader: React.FC<Props> = props => {
  const { t } = useTranslation();

  return (
    <View>
      {Platform.OS === 'ios' && (
        <OLCompetitionIOSHeader name={props.competition.name} />
      )}
      {Platform.OS === 'android' && <View style={{ height: px(10) }} />}

      {props.competition.eventor && props.competition.canceled && (
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
            font="Proxima-Nova-Bold regular"
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
          {props.competition.eventor && (
            <View
              style={{
                alignItems: 'center',
                paddingBottom: px(25),
              }}
            >
              {props.competition.eventor && (
                <OLCompetitionClub
                  name={props.competition.club}
                  logoUrl={props.competition.clubLogoUrl}
                  size={_.last(props.competition.clubLogoSizes)}
                />
              )}
            </View>
          )}

          <OLText
            size={16}
            font="Proxima Nova Regular"
            style={{ marginBottom: px(15) }}
          >
            {t('competitions.date')}: {dateToReadable(props.competition.date)}
          </OLText>

          <OLText
            size={16}
            font="Proxima Nova Regular"
            style={{ marginBottom: px(15) }}
          >
            {t('competitions.organizedBy')}: {props.competition.organizer}
          </OLText>

          {props.competition.eventor && (
            <>
              <OLText
                size={16}
                font="Proxima Nova Regular"
                style={{ marginBottom: px(15) }}
              >
                {t('competitions.distance')}:{' '}
                {t(`distances.${props.competition.distance}`)}
              </OLText>

              <OLText
                font="Proxima Nova Regular"
                style={{ marginBottom: px(15) }}
                size={16}
              >
                {t('competitions.signups')}: {props.competition.signups}
              </OLText>
            </>
          )}
        </View>

        {props.competition.eventor && !!props.competition.info && (
          <CompetitionInfoBox infoHtml={props.competition.info} />
        )}
      </View>

      <View
        style={{
          paddingHorizontal: px(15),
          marginBottom: px(15),
          marginTop: px(25),
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 1 }}>
          <OLText
            font="Proxima-Nova-Bold regular"
            size={20}
            style={{
              textAlign: 'left',
              color: 'black',
            }}
          >
            {t('competitions.classes')}
          </OLText>
        </View>

        <View>
          <OLButton small onPress={props.goToLastPassings}>
            {t('competitions.lastPassings')}
          </OLButton>
        </View>
      </View>
    </View>
  );
};
