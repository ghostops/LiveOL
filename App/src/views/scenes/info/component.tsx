import React from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import { OLButton } from '~/views/components/button';
import { OLCard } from '~/views/components/card';
import { OLFlag } from '~/views/components/lang/flag';
import { OLText } from '~/views/components/text';
import { VERSION, px } from '~/util/const';
import { PickerButton } from '~/views/components/lang/picker';
import { useTranslation } from 'react-i18next';

type Props = {
  landscape: boolean;
  contact: () => void;
  openPhraseApp: () => void;
  translationCredits: { code: string; name: string }[];
  secretTap: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  textSizeMultiplier: number;
  onGetLiveOlPlus: () => void;
  showGetLiveOlPlus?: boolean;
  plusWillRenew?: boolean;
  plusExpirationDate?: string;
  redeemPlusCode: () => void;
  onNewsletterPress: () => void;
  goToMyWebsite: () => void;
};

export const OLInfo: React.FC<Props> = ({
  landscape,
  contact,
  translationCredits,
  secretTap,
  increaseFontSize,
  decreaseFontSize,
  textSizeMultiplier,
  onGetLiveOlPlus,
  showGetLiveOlPlus,
  plusExpirationDate,
  plusWillRenew,
  redeemPlusCode,
  onNewsletterPress,
  goToMyWebsite,
}) => {
  const { t } = useTranslation();

  const buttons = [
    {
      text: t('info.contact'),
      onPress: contact,
    },
    {
      text: t('plus.code.redeem'),
      onPress: redeemPlusCode,
    },
    {
      text: t('info.newsletter'),
      onPress: onNewsletterPress,
    },
  ];

  const renderTranslationCredit = (
    { code, name }: { code: string; name: string },
    index: number,
  ) => (
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
        size={32}
        style={{ borderColor: 'black', borderWidth: 1 }}
      />

      <OLText
        size={16}
        style={{
          marginLeft: px(5),
        }}
      >
        {name}
      </OLText>
    </View>
  );

  return (
    <ScrollView
      style={{
        paddingVertical: px(10),
        paddingHorizontal: px(landscape ? 40 : 10),
      }}
    >
      {showGetLiveOlPlus && (
        <View>
          <OLCard style={{ marginVertical: px(8) }}>
            <OLText
              size={16}
              style={{
                marginBottom: px(16),
                textAlign: 'center',
              }}
            >
              {t('plus.buy.text')}
            </OLText>
            <OLButton onPress={onGetLiveOlPlus}>{t('plus.promo.get')}</OLButton>
          </OLCard>
        </View>
      )}

      {!!plusExpirationDate && (
        <View>
          <OLCard style={{ marginVertical: px(8) }}>
            <OLText
              size={18}
              bold
              style={{
                textAlign: 'center',
                marginBottom: px(8),
              }}
            >
              {t('plus.status.title')}
            </OLText>
            <OLText
              size={14}
              style={{
                textAlign: 'center',
              }}
            >
              {plusWillRenew
                ? t('plus.status.renew', { date: plusExpirationDate })
                : t('plus.status.expire', { date: plusExpirationDate })}
            </OLText>
          </OLCard>
        </View>
      )}

      <View>
        <OLCard style={{ marginVertical: px(8) }}>
          {(t('info.body', { returnObjects: true }) as unknown as string[]).map(
            (text: string) => (
              <OLText
                size={16}
                key={text}
                style={{
                  marginBottom: px(16),
                }}
              >
                {text}
              </OLText>
            ),
          )}
        </OLCard>

        <OLCard style={{ marginVertical: px(8) }}>
          <TouchableOpacity
            style={{ width: '100%' }}
            onPress={secretTap}
            activeOpacity={1}
          >
            <OLText
              bold
              size={16}
              style={{
                marginBottom: px(16),
              }}
            >
              {t('info.version')}: {VERSION}
            </OLText>
          </TouchableOpacity>

          {buttons.map((button, index) => {
            return (
              <OLButton
                key={`${button.text}/${index}`}
                onPress={() => button.onPress && button.onPress()}
                style={{
                  marginBottom: index !== buttons.length - 1 ? px(16) : 0,
                }}
              >
                {button.text}
              </OLButton>
            );
          })}
        </OLCard>
      </View>

      <View>
        <OLCard>
          <OLText
            bold
            size={16}
            style={{
              marginBottom: px(8),
            }}
          >
            {t('info.changeTextSize.title')} ({textSizeMultiplier.toFixed(1)})
          </OLText>

          <OLText size={14}>{t('info.changeTextSize.text')}</OLText>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              paddingTop: px(16),
            }}
          >
            <OLButton onPress={decreaseFontSize}>
              {t('info.changeTextSize.decrease')}
            </OLButton>
            <OLButton onPress={increaseFontSize}>
              {t('info.changeTextSize.increase')}
            </OLButton>
          </View>
        </OLCard>
      </View>

      <View>
        <OLCard style={{ marginVertical: px(8) }}>
          <OLText bold size={18}>
            {t('info.translations.credit')}:
          </OLText>

          {translationCredits.map(renderTranslationCredit)}

          <View style={{ height: 16 }} />

          <PickerButton />
        </OLCard>
      </View>

      <TouchableOpacity onPress={goToMyWebsite} style={{ marginTop: px(8) }}>
        <OLText size={16}>LiveOL by Ludvig Larsendahl</OLText>
      </TouchableOpacity>

      <View style={{ height: px(65) }} />
    </ScrollView>
  );
};
