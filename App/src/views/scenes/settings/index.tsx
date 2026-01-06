import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { OLText } from '~/views/components/text';
import { COLORS, px, VERSION } from '~/util/const';
import { useTranslation } from 'react-i18next';
import { OLButton } from '~/views/components/button';
import { useTextStore } from '~/store/text';
import { OLFlag } from '~/views/components/lang/flag';
import { useOLNavigation } from '~/hooks/useNavigation';
import { RefreshInterval } from '../profile/RefreshInterval';
import { useUserIdStore } from '~/store/userId';

const ITEM_TEXT_SIZE = 14;

export const OLSceneSettings = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useOLNavigation();
  const userId = useUserIdStore(state => state.userId);

  const { textSizeMultiplier, setTextSizeMultiplier } = useTextStore();

  const increaseTextSize = () => {
    if (textSizeMultiplier >= 1.25) {
      return;
    }
    setTextSizeMultiplier(textSizeMultiplier + 0.1);
  };

  const decreaseTextSize = () => {
    if (textSizeMultiplier <= 0.75) {
      return;
    }
    setTextSizeMultiplier(textSizeMultiplier - 0.1);
  };

  // External links
  const handleContactPress = () => {
    Linking.openURL('https://orienteeringliveresults.com/contact');
  };
  const handleNewsletterPress = () => {
    Linking.openURL('https://orienteeringliveresults.com/newsletter');
  };
  const handleReportBug = () => {
    Linking.openURL('https://orienteeringliveresults.com/issues');
  };
  const handleGoToWebsite = () => {
    Linking.openURL('https://orienteeringliveresults.com/ludvig');
  };
  const handleHelpTranslate = () => {
    Linking.openURL('https://orienteeringliveresults.com/translate');
  };
  const handleOpenTerms = () =>
    Linking.openURL('https://orienteeringliveresults.com/terms');
  const handleOpenPrivacy = () =>
    Linking.openURL('https://orienteeringliveresults.com/privacy');

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: px(64) }}
      >
        <View style={{ margin: px(8) }}>
          <OLText bold size={14}>
            {t('Appearance')}
          </OLText>
        </View>

        <View style={styles.item}>
          <OLText size={16}>
            {t('Text size')}: {textSizeMultiplier.toFixed(1)}
          </OLText>

          <View
            style={{
              flexDirection: 'row',
              gap: px(ITEM_TEXT_SIZE),
            }}
          >
            <OLButton
              onPress={decreaseTextSize}
              style={{
                paddingHorizontal: px(ITEM_TEXT_SIZE),
                paddingVertical: px(8),
              }}
            >
              -
            </OLButton>
            <OLButton
              onPress={increaseTextSize}
              style={{
                paddingHorizontal: px(ITEM_TEXT_SIZE),
                paddingVertical: px(8),
              }}
            >
              +
            </OLButton>
          </View>
        </View>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigate('Language')}
        >
          <OLText size={16}>{t('Language')}</OLText>

          <View>
            <OLFlag code={i18n.language} size={28} />
          </View>
        </TouchableOpacity>

        <View style={styles.item}>
          <View>
            <OLText size={16} style={{ marginBottom: px(12) }}>
              {t('How often results auto-refreshes')}
            </OLText>

            <RefreshInterval />
          </View>
        </View>

        <View style={{ margin: px(8) }}>
          <OLText bold size={14}>
            {t('About & Support')}
          </OLText>
        </View>

        <View style={styles.item}>
          <OLText size={16}>{t('Current version')}</OLText>

          <View>
            <OLText size={16} mono style={{ color: COLORS.GRAY }}>
              v{VERSION}
            </OLText>
          </View>
        </View>

        <TouchableOpacity style={styles.item} onPress={handleContactPress}>
          <OLText size={16}>{t('Contact me')}</OLText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleReportBug}>
          <OLText size={16}>{t('Report a bug')}</OLText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleNewsletterPress}>
          <OLText size={16}>{t('Sign up for news')}</OLText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleGoToWebsite}>
          <OLText size={16}>{t('Made by Ludvig Larsendahl')}</OLText>
        </TouchableOpacity>

        <View style={{ margin: px(8) }}>
          <OLText bold size={14}>
            {t('Data & Privacy')}
          </OLText>
        </View>

        <View style={styles.item}>
          <OLText size={16}>{t('User ID')}</OLText>
          <OLText size={16} style={{ color: COLORS.GRAY }} mono>
            {userId || '...'}
          </OLText>
        </View>

        <TouchableOpacity style={styles.item} onPress={handleOpenTerms}>
          <OLText size={16}>{t('Terms of Service')}</OLText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleOpenPrivacy}>
          <OLText size={16}>{t('Privacy Policy')}</OLText>
        </TouchableOpacity>

        <View style={{ margin: px(8) }}>
          <OLText bold size={14}>
            {t('Translations')}
          </OLText>
        </View>

        <TouchableOpacity style={styles.item} onPress={handleHelpTranslate}>
          <OLText size={16}>
            {t('Help out translating - Get free LiveOL+')}
          </OLText>
        </TouchableOpacity>

        <View
          style={[
            styles.item,
            { flexDirection: 'column', alignItems: 'flex-start', gap: px(8) },
          ]}
        >
          <OLText bold size={14}>
            {t('Translations with the help from')}:
          </OLText>
          {translationCredits.map(({ code, name }, index) => (
            <View
              key={`${code}:${index}`}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <OLText size={16}>{name}</OLText>

              <OLFlag
                code={code}
                size={24}
                style={{ borderColor: COLORS.GRAY, borderWidth: 1 }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: px(12),
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: px(16),
    borderBottomColor: COLORS.BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const translationCredits: { code: string; name: string }[] = [
  {
    code: 'no',
    name: 'Pål Kittilsen',
  },
  {
    code: 'sr',
    name: 'Nikola Spaskovic',
  },
  {
    code: 'it',
    name: 'Paolo Gallerani',
  },
  {
    code: 'cs',
    name: 'Petr Havliček',
  },
  {
    code: 'de',
    name: 'Petr Havliček',
  },
  {
    code: 'es',
    name: 'Adrian Perez',
  },
];
