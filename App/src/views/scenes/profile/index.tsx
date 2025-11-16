import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from 'react-native';
import { OLButton } from '~/views/components/button';
import { OLCard } from '~/views/components/card';
import { OLText } from '~/views/components/text';
import { OLIcon } from '~/views/components/icon';
import { OLFlag } from '~/views/components/lang/flag';
import { COLORS, px, VERSION } from '~/util/const';
import { PickerButton } from '~/views/components/lang/picker';
import { useTranslation } from 'react-i18next';
import { useIap } from '~/hooks/useIap';
import { useTextStore } from '~/store/text';
import { useDeviceIdStore } from '~/store/deviceId';
import { useOLNavigation } from '~/hooks/useNavigation';
import { format } from 'date-fns';

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
  const { t } = useTranslation();

  // IAP
  const {
    plusActive,
    plusExpirationDate,
    plusWillRenew,
    displayPrice,
    presentPaywall,
    restore,
  } = useIap();

  // Text size
  const { textSizeMultiplier, setTextSizeMultiplier } = useTextStore();

  // Device ID
  const { deviceId } = useDeviceIdStore();

  // Mocked state for future features
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(15);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>(
    'light',
  );

  // Plus benefits
  const plusBenefits = [
    t('plus.benefits.sorting'),
    t('plus.benefits.tracking'),
    t('plus.benefits.support'),
  ];

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

  // Subscription handlers
  const handleGetLiveOlPlus = () => {
    presentPaywall();
  };
  const handleRestorePurchases = () => {
    restore();
  };

  // Theme handler (mocked - not fully implemented)
  const handleToggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setCurrentTheme(nextTheme);
    Alert.alert(t('profile.settings.themeChanged'), `Theme: ${nextTheme}`);
  };

  // Auto-refresh handler (mocked)
  const handleChangeAutoRefresh = (interval: number) => {
    setAutoRefreshInterval(interval);
  };

  // Clear cache handler (mocked)
  const handleClearCache = () => {
    Alert.alert(
      t('profile.settings.clearCache'),
      t('profile.settings.clearCacheConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: () => {
            // Mock implementation - in real app would clear AsyncStorage cache
            Alert.alert(
              t('common.success'),
              t('profile.settings.cacheCleared'),
            );
          },
        },
      ],
    );
  };

  // External links
  const handleContactPress = () => {
    Linking.openURL('https://liveol.larsendahl.se/#contact');
  };

  const handleNewsletterPress = () => {
    Linking.openURL('https://liveol.larsendahl.se/newsletter');
  };

  const handleReportBug = () => {
    Linking.openURL('https://github.com/ludviglarsendahl/liveol/issues');
  };

  const handleGoToWebsite = () => {
    Linking.openURL('https://larsendahl.com');
  };

  const openTerms = () => Linking.openURL('https://liveol.larsendahl.se/terms');
  const openPrivacy = () =>
    Linking.openURL('https://liveol.larsendahl.se/privacy');
  const openLicenses = () =>
    Linking.openURL('https://liveol.larsendahl.se/licenses');

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
      }}
      contentContainerStyle={{
        paddingVertical: px(16),
        paddingHorizontal: px(16),
      }}
    >
      {/* HEADER SECTION */}
      <View
        style={{
          alignItems: 'center',
          marginBottom: px(24),
        }}
      >
        <View
          style={{
            width: px(80),
            height: px(80),
            borderRadius: px(40),
            backgroundColor: plusActive ? COLORS.MAIN : COLORS.GRAY,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: px(12),
          }}
        >
          <OLIcon name="person" size={40} color={COLORS.WHITE} />
        </View>

        <View
          style={{
            backgroundColor: plusActive ? COLORS.MAIN : COLORS.GRAY,
            paddingHorizontal: px(16),
            paddingVertical: px(6),
            borderRadius: px(16),
          }}
        >
          <OLText size={14} bold style={{ color: COLORS.WHITE }}>
            {plusActive ? t('plus.status.active') : t('plus.status.free')}
          </OLText>
        </View>
      </View>

      {/* SUBSCRIPTION MANAGEMENT SECTION */}
      <OLCard style={{ marginBottom: px(16) }}>
        <OLText bold size={20} style={{ marginBottom: px(12) }}>
          {t('profile.subscription.title')}
        </OLText>

        {plusActive ? (
          <>
            {/* Active Subscription Card */}
            <View
              style={{
                backgroundColor: COLORS.LIGHT,
                padding: px(16),
                borderRadius: px(8),
                marginBottom: px(16),
              }}
            >
              <OLText
                size={16}
                bold
                style={{ color: COLORS.WHITE, marginBottom: px(8) }}
              >
                LiveOL Plus
              </OLText>
              <OLText
                size={14}
                style={{ color: COLORS.WHITE, marginBottom: px(12) }}
              >
                {plusWillRenew
                  ? t('plus.status.renew', {
                      date: plusExpirationDate
                        ? format(plusExpirationDate, 'P')
                        : '',
                    })
                  : t('plus.status.expire', {
                      date: plusExpirationDate
                        ? format(plusExpirationDate, 'P')
                        : '',
                    })}
              </OLText>

              <View style={{ marginTop: px(8) }}>
                {plusBenefits.map((benefit, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: px(6),
                    }}
                  >
                    <OLIcon
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.WHITE}
                      style={{ marginRight: px(8) }}
                    />
                    <OLText size={14} style={{ color: COLORS.WHITE }}>
                      {benefit}
                    </OLText>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleRestorePurchases}>
              <OLText
                size={14}
                style={{ color: COLORS.BLUE, textAlign: 'center' }}
              >
                {t('plus.restore')}
              </OLText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Free Tier - Upgrade Prompt */}
            <OLText size={16} style={{ marginBottom: px(16) }}>
              {t('plus.buy.text')}
            </OLText>

            <View
              style={{
                backgroundColor: COLORS.BACKGROUND,
                padding: px(16),
                borderRadius: px(8),
                marginBottom: px(16),
              }}
            >
              {plusBenefits.map((benefit, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: px(8),
                  }}
                >
                  <OLIcon
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.GREEN}
                    style={{ marginRight: px(8) }}
                  />
                  <OLText size={14}>{benefit}</OLText>
                </View>
              ))}
            </View>

            {displayPrice && (
              <OLText
                size={18}
                bold
                style={{ textAlign: 'center', marginBottom: px(12) }}
              >
                {displayPrice} / {t('plus.perYear')}
              </OLText>
            )}

            <OLButton
              onPress={handleGetLiveOlPlus}
              style={{ marginBottom: px(12) }}
            >
              {t('plus.promo.get')}
            </OLButton>

            <TouchableOpacity onPress={handleRestorePurchases}>
              <OLText
                size={14}
                style={{ color: COLORS.BLUE, textAlign: 'center' }}
              >
                {t('plus.restore')}
              </OLText>
            </TouchableOpacity>
          </>
        )}
      </OLCard>

      {/* SETTINGS & PREFERENCES SECTION */}
      <OLCard style={{ marginBottom: px(16) }}>
        <OLText bold size={20} style={{ marginBottom: px(16) }}>
          {t('profile.settings.title')}
        </OLText>

        {/* Appearance */}
        <View style={{ marginBottom: px(20) }}>
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
              marginBottom: px(12),
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

          {/* Theme (mocked - not implemented yet) */}
          <OLText size={14} style={{ marginBottom: px(8) }}>
            {t('profile.settings.theme')}
          </OLText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: px(12),
            }}
          >
            {(['light', 'dark', 'auto'] as const).map(theme => (
              <TouchableOpacity
                key={theme}
                onPress={handleToggleTheme}
                style={{
                  flex: 1,
                  marginHorizontal: px(4),
                  padding: px(10),
                  borderRadius: px(8),
                  backgroundColor:
                    currentTheme === theme ? COLORS.MAIN : COLORS.BORDER,
                  alignItems: 'center',
                }}
              >
                <OLText
                  size={13}
                  style={{
                    color: currentTheme === theme ? COLORS.WHITE : COLORS.BLACK,
                  }}
                >
                  {t(`profile.settings.theme.${theme}`)}
                </OLText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={{ marginBottom: px(20) }}>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('profile.settings.language')}
          </OLText>
          <PickerButton />
        </View>

        {/* Results Preferences (mocked) */}
        <View style={{ marginBottom: px(20) }}>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('profile.settings.results')}
          </OLText>
          <OLText size={14} style={{ marginBottom: px(8) }}>
            {t('profile.settings.autoRefresh')} ({autoRefreshInterval}s)
          </OLText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {[10, 15, 30, 60].map(interval => (
              <TouchableOpacity
                key={interval}
                onPress={() => handleChangeAutoRefresh(interval)}
                style={{
                  paddingHorizontal: px(16),
                  paddingVertical: px(8),
                  borderRadius: px(8),
                  backgroundColor:
                    autoRefreshInterval === interval
                      ? COLORS.MAIN
                      : COLORS.BORDER,
                }}
              >
                <OLText
                  size={13}
                  style={{
                    color:
                      autoRefreshInterval === interval
                        ? COLORS.WHITE
                        : COLORS.BLACK,
                  }}
                >
                  {interval}s
                </OLText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data & Privacy */}
        <View>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('profile.settings.data')}
          </OLText>

          {deviceId && (
            <View style={{ marginBottom: px(12) }}>
              <OLText size={12} style={{ color: COLORS.GRAY }}>
                {t('profile.settings.deviceId')}: {deviceId}
              </OLText>
            </View>
          )}

          <OLButton onPress={handleClearCache}>
            {t('profile.settings.clearCache')}
          </OLButton>
        </View>
      </OLCard>

      {/* ABOUT & SUPPORT SECTION */}
      <OLCard style={{ marginBottom: px(16) }}>
        <OLText bold size={20} style={{ marginBottom: px(16) }}>
          {t('profile.about.title')}
        </OLText>

        {/* App Info */}
        <View style={{ marginBottom: px(16) }}>
          <OLText size={14} style={{ marginBottom: px(8) }}>
            {t('info.version')}: {VERSION}
          </OLText>

          {/* About Text */}
          {(t('info.body', { returnObjects: true }) as unknown as string[]).map(
            (text: string, index: number) => (
              <OLText
                size={14}
                key={index}
                style={{
                  marginBottom: px(8),
                  color: COLORS.GRAY,
                }}
              >
                {text}
              </OLText>
            ),
          )}
        </View>

        {/* Support Buttons */}
        <View style={{ marginBottom: px(16) }}>
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

        {/* Translation Credits */}
        <View>
          <OLText bold size={16} style={{ marginBottom: px(8) }}>
            {t('info.translations.credit')}
          </OLText>
          {translationCredits.map(({ code, name }, index) => (
            <View
              key={`${code}:${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: px(8),
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
        </View>
      </OLCard>

      {/* LEGAL & INFO SECTION */}
      <OLCard style={{ marginBottom: px(16) }}>
        <OLText bold size={20} style={{ marginBottom: px(16) }}>
          {t('profile.legal.title')}
        </OLText>

        <TouchableOpacity onPress={openTerms} style={{ marginBottom: px(12) }}>
          <OLText size={14} style={{ color: COLORS.BLUE }}>
            {t('profile.legal.terms')}
          </OLText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openPrivacy}
          style={{ marginBottom: px(12) }}
        >
          <OLText size={14} style={{ color: COLORS.BLUE }}>
            {t('profile.legal.privacy')}
          </OLText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openLicenses}
          style={{ marginBottom: px(16) }}
        >
          <OLText size={14} style={{ color: COLORS.BLUE }}>
            {t('profile.legal.licenses')}
          </OLText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoToWebsite}>
          <OLText size={14} style={{ color: COLORS.GRAY, textAlign: 'center' }}>
            LiveOL by Ludvig Larsendahl
          </OLText>
        </TouchableOpacity>
      </OLCard>

      {/* Bottom Spacing */}
      <View style={{ height: px(32) }} />
    </ScrollView>
  );
};
