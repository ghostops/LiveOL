import { ScrollView, TouchableOpacity, View, Linking } from 'react-native';
import { OLButton } from '~/views/components/button';
import { OLCard } from '~/views/components/card';
import { OLText } from '~/views/components/text';
import { OLFlag } from '~/views/components/lang/flag';
import { COLORS, px, VERSION } from '~/util/const';
import { PickerButton } from '~/views/components/lang/picker';
import { useTranslation } from 'react-i18next';
import { useTextStore } from '~/store/text';
import { UserProfileForm } from './UserProfileForm';
import { SubscriptionManagement } from './SubscriptionManagement';
import { RefreshInterval } from './RefreshInterval';
import { useUserIdStore } from '~/store/userId';

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

export const OLProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { textSizeMultiplier, setTextSizeMultiplier } = useTextStore();
  const userId = useUserIdStore(state => state.userId);

  // Text size handlers
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
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
      }}
      contentContainerStyle={{
        paddingVertical: px(16),
        paddingHorizontal: px(16),
        gap: px(8),
      }}
    >
      <OLCard>
        <UserProfileForm />
      </OLCard>

      <View>
        <SubscriptionManagement />
      </View>

      {/* SETTINGS & PREFERENCES SECTION */}
      <OLCard style={{ gap: px(16) }}>
        <OLText bold size={20}>
          {t('profile.settings.title')}
        </OLText>

        {/* Appearance */}
        <View>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('profile.settings.appearance')}
          </OLText>

          {/* Text Size */}
          <OLText size={14} style={{ marginBottom: px(8) }}>
            {t('info.changeTextSize.title')} ({textSizeMultiplier.toFixed(1)})
          </OLText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <OLButton
              onPress={decreaseTextSize}
              style={{ flex: 1, marginRight: px(8) }}
            >
              {t('info.changeTextSize.decrease')}
            </OLButton>
            <OLButton
              onPress={increaseTextSize}
              style={{ flex: 1, marginLeft: px(8) }}
            >
              {t('info.changeTextSize.increase')}
            </OLButton>
          </View>
        </View>

        {/* Language */}
        <View
          style={{
            gap: px(8),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <OLText bold size={16}>
              {t('profile.settings.language')}
            </OLText>
            <OLFlag code={i18n.language} size={28} />
          </View>
          <PickerButton />
        </View>

        <View>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('profile.settings.results')}
          </OLText>
          <OLText size={14} style={{ marginBottom: px(8) }}>
            {t('profile.settings.autoRefresh')}
          </OLText>
          <RefreshInterval />
        </View>

        {/* Data & Privacy */}
        <View>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('profile.settings.data')}
          </OLText>

          {userId && (
            <View>
              <OLText size={14} style={{ color: COLORS.GRAY }} mono>
                {t('profile.settings.userId')}: {userId}
              </OLText>
            </View>
          )}
        </View>
      </OLCard>

      <OLCard style={{ gap: px(16) }}>
        <View style={{ gap: px(8) }}>
          <OLText bold size={20}>
            {t('profile.about.title')}
          </OLText>

          <OLText size={14}>
            {t('info.version')}: {VERSION}
          </OLText>

          <OLText size={14} style={{}}>
            {t('profile.about.text')}
          </OLText>
        </View>

        {/* Support Buttons */}
        <View>
          <OLButton
            onPress={handleContactPress}
            style={{ marginBottom: px(12) }}
          >
            {t('info.contact')}
          </OLButton>

          <OLButton onPress={handleReportBug} style={{ marginBottom: px(12) }}>
            {t('profile.about.reportBug')}
          </OLButton>

          <OLButton onPress={handleNewsletterPress}>
            {t('info.newsletter')}
          </OLButton>
        </View>

        <View>
          <OLText bold size={16}>
            {t('info.translations.credit')}:
          </OLText>
          {translationCredits.map(({ code, name }, index) => (
            <View
              key={`${code}:${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: px(8),
                marginLeft: px(2),
              }}
            >
              <OLFlag
                code={code}
                size={24}
                style={{ borderColor: COLORS.GRAY, borderWidth: 1 }}
              />
              <OLText size={14} style={{ marginLeft: px(8) }}>
                {name}
              </OLText>
            </View>
          ))}

          <OLButton
            onPress={handleHelpTranslate}
            small
            style={{ marginTop: px(8) }}
          >
            {t('info.translations.freePlus')}
          </OLButton>
        </View>
      </OLCard>

      {/* LEGAL & INFO SECTION */}
      <OLCard style={{ gap: px(8) }}>
        <OLText bold size={20}>
          {t('profile.legal.title')}
        </OLText>

        <TouchableOpacity onPress={handleOpenTerms}>
          <OLText size={14} style={{ color: COLORS.BLUE }}>
            {t('profile.legal.terms')}
          </OLText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenPrivacy}>
          <OLText size={14} style={{ color: COLORS.BLUE }}>
            {t('profile.legal.privacy')}
          </OLText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoToWebsite}>
          <OLText size={14} style={{ color: COLORS.BLUE }}>
            LiveO: Ludvig Larsendahl
          </OLText>
        </TouchableOpacity>
      </OLCard>

      {/* Bottom Spacing */}
      <View style={{ height: px(32) }} />
    </ScrollView>
  );
};
