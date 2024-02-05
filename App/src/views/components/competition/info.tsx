import { TouchableOpacity, View } from 'react-native';
import { OLText } from '../text';
import Hyperlink from 'react-native-hyperlink';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useTheme } from '~/hooks/useTheme';

interface Props {
  infoHtml: string;
}
export const CompetitionInfoBox: React.FC<Props> = ({ infoHtml }) => {
  const { t } = useTranslation();
  const { px, colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.BLUE,
        padding: px(20),
        borderRadius: 4,
        marginTop: px(5),
      }}
    >
      <OLText
        size={22}
        bold
        style={{
          color: 'white',
          paddingBottom: px(10),
        }}
      >
        {t('competitions.info')}
      </OLText>

      <InfoHtml html={infoHtml} />
    </View>
  );
};

const parseHtml = (text: string, long = true): string => {
  let parsed: string = text;

  // Parse line breaks
  parsed = parsed.replace(/<br>/gm, '\n');

  // Parse a-tag endings
  parsed = parsed.replace(/<\/a>/gm, '\n');

  // Parse a-tag openers
  parsed = parsed.replace(/<a(.*?)>/gm, '');

  if (!long) {
    parsed = parsed.substring(0, 120) + '...';
  }

  return parsed;
};

const InfoHtml: React.FC<{ html: string }> = ({ html }) => {
  const [seeMore, setSeeMore] = useState(false);
  const { px } = useTheme();
  const { t } = useTranslation();
  const parsedText = parseHtml(html, seeMore);

  return (
    <>
      <Hyperlink
        linkDefault={true}
        linkStyle={{
          textDecorationStyle: 'solid',
          textDecorationLine: 'underline',
        }}
      >
        <OLText size={14} style={{ color: 'white' }}>
          {parsedText}
        </OLText>
      </Hyperlink>
      {!seeMore && (
        <TouchableOpacity
          onPress={() => setSeeMore(true)}
          style={{ marginTop: px(8) }}
        >
          <OLText
            size={12}
            style={{ color: 'white', textDecorationLine: 'underline' }}
          >
            {t('competitions.readMore')}
          </OLText>
        </TouchableOpacity>
      )}
    </>
  );
};
