import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { useIap } from '~/hooks/useIap';
import { COLORS, px } from '~/util/const';
import { OLButton } from '~/views/components/button';
import { OLCard } from '~/views/components/card';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';

export const SubscriptionManagement = () => {
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

  // Subscription handlers
  const handleGetLiveOlPlus = () => {
    presentPaywall();
  };
  const handleRestorePurchases = () => {
    restore();
  };

  const plusBenefits = [
    t('Sort results by any column'),
    t('Follow unlimited runners'),
    t('Support LiveOL development'),
  ];

  const formattedExpirationDate = plusExpirationDate
    ? format(plusExpirationDate, 'P')
    : __DEV__
      ? '2099-12-31'
      : '';

  return (
    <View>
      {plusActive ? (
        <View
          style={{
            backgroundColor: COLORS.MAIN,
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
              ? t(
                  'Thanks for supporting LiveOL, you subscription will renew by: {{ date }}',
                  {
                    date: formattedExpirationDate,
                  },
                )
              : t(
                  'Thanks for having supported LiveOL, you subscription will expire by: {{ date }}',
                  {
                    date: formattedExpirationDate,
                  },
                )}
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
      ) : (
        <OLCard>
          <OLText size={16} bold style={{ marginBottom: px(8) }}>
            {t('Subscription')}
          </OLText>
          <OLText size={14} style={{ marginBottom: px(16) }}>
            {t(
              'Unlock exclusive benefits and power the project forward with a budget-friendly annual subscription, ensuring LiveOL thrives.',
            )}
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
              {displayPrice} / {t('per year')}
            </OLText>
          )}

          <OLButton
            onPress={handleGetLiveOlPlus}
            style={{ marginBottom: px(12) }}
          >
            {t('Get LiveOL+')}
          </OLButton>

          <TouchableOpacity onPress={handleRestorePurchases}>
            <OLText
              size={14}
              style={{ color: COLORS.BLUE, textAlign: 'center' }}
            >
              {t('Restore purchases')}
            </OLText>
          </TouchableOpacity>
        </OLCard>
      )}
    </View>
  );
};
