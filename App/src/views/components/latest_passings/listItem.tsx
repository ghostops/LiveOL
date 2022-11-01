import * as React from 'react';
import { OLText } from '../text';
import { Passing } from 'lib/graphql/fragments/types/Passing';
import { px, fontPx } from 'util/const';
import { TextStyle, View } from 'react-native';
import { OLCard } from '../card';
import { useTranslation } from 'react-i18next';

interface Props {
  passing: Passing;
  landscape?: boolean;
}

const TEXT_STYLE: TextStyle = {
  fontSize: fontPx(16),
  paddingVertical: px(8),
};

export const OLLastPassingResult: React.FC<Props> = ({
  passing,
  landscape,
}) => {
  const { t } = useTranslation();
  return (
    <OLCard
      key={passing.time + passing.runnerName}
      style={{
        marginBottom: landscape ? 0 : px(15),
        marginRight: landscape ? px(15) : 0,
        flex: landscape ? 1 : 0,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        {!landscape && (
          <View>
            <OLText font="Proxima Nova Regular" size={16} style={TEXT_STYLE}>
              {t('competitions.passings.class')}:
            </OLText>
            <OLText font="Proxima Nova Regular" size={16} style={TEXT_STYLE}>
              {t('competitions.passings.name')}:
            </OLText>
            <OLText font="Proxima Nova Regular" size={16} style={TEXT_STYLE}>
              {t('competitions.passings.passTime')}:
            </OLText>
          </View>
        )}
        <View
          style={{
            flex: 1,
            paddingLeft: landscape ? px(8) : px(16),
          }}
        >
          <OLText font="Proxima Nova Regular" size={16} style={TEXT_STYLE}>
            {passing.class}
          </OLText>
          <OLText
            font="Proxima Nova Regular"
            size={16}
            style={TEXT_STYLE}
            numberOfLines={1}
          >
            {passing.runnerName}
          </OLText>
          <OLText font="Proxima Nova Regular" size={16} style={TEXT_STYLE}>
            {passing.passtime}
          </OLText>
        </View>
      </View>
    </OLCard>
  );
};
