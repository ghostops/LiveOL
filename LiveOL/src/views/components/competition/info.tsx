import * as React from 'react';
import { Lang } from 'lib/lang';
import { View } from 'react-native';
import { px } from 'util/const';
import { OLText } from '../text';
import Hyperlink from 'react-native-hyperlink';

interface Props {
  infoHtml: string;
}
export const CompetitionInfoBox: React.FC<Props> = ({ infoHtml }) => {
  return (
    <View
      style={{
        backgroundColor: '#3867d6',
        padding: px(20),
        borderRadius: 4,
        marginTop: px(5),
      }}>
      <OLText
        size={26}
        font="Rift Bold"
        style={{
          color: 'white',
          paddingBottom: px(10),
        }}>
        {Lang.print('competitions.info')}
      </OLText>

      <InfoHtml html={infoHtml} />
    </View>
  );
};

const parseHtml = (text: string): string => {
  let parsed: string = text;

  // Parse line breaks
  parsed = parsed.replace(/<br>/gm, '\n');

  // Parse a-tag endings
  parsed = parsed.replace(/<\/a>/gm, '\n');

  // Parse a-tag openers
  parsed = parsed.replace(/<a(.*?)>/gm, '');

  return parsed;
};

const InfoHtml: React.FC<{ html: string }> = ({ html }) => {
  const parsedText = parseHtml(html);

  return (
    <Hyperlink
      linkDefault={true}
      linkStyle={{
        textDecorationStyle: 'solid',
        textDecorationLine: 'underline',
      }}>
      <OLText font="Proxima Nova Regular" size={14} style={{ color: 'white' }}>
        {parsedText}
      </OLText>
    </Hyperlink>
  );
};
