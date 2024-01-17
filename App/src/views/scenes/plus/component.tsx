import React from 'react';
import { useTheme } from '~/hooks/useTheme';
import {
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { OLText } from '~/views/components/text';
import { OLButton } from '~/views/components/button';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OLIcon } from '~/views/components/icon';

export type OLPlusFeatureKey =
  | 'followRunner'
  | 'followClub'
  | 'followClass'
  | 'sorting';

type OLPlusFeatureProps = {
  featured?: boolean;
  title: string;
  text: string;
};

const OLPlusFeature: React.FC<OLPlusFeatureProps> = ({
  text,
  title,
  featured,
}) => {
  const { px, colors } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: px(32),
        },
        featured && {
          borderWidth: 2,
          borderColor: colors.MAIN,
          paddingVertical: px(8),
          paddingHorizontal: px(4),
          borderRadius: 8,
        },
      ]}
    >
      <OLIcon name="checkmark-circle-outline" size={32} />
      <View style={{ marginLeft: px(8), flex: 1 }}>
        <OLText size={18} style={{ marginBottom: px(4) }} bold>
          {title}
        </OLText>
        <OLText size={14}>{text}</OLText>
      </View>
    </View>
  );
};

type Props = {
  price?: string;
  onBuy?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  loading?: boolean;
  feature?: OLPlusFeatureKey;
};

export const OLPlus: React.FC<Props> = ({
  price,
  onBuy,
  onRestore,
  loading,
  feature,
}) => {
  const { px } = useTheme();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: 'white',
        flex: 1,
        paddingBottom: bottom,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: px(64) }}
      >
        <OLText
          bold
          size={28}
          style={{ textAlign: 'center', margin: px(16), marginTop: px(32) }}
        >
          {t('plus.buy.title')}
        </OLText>

        <OLText
          size={16}
          style={{
            textAlign: 'center',
            marginHorizontal: px(16),
            marginBottom: px(32),
          }}
        >
          {t('plus.buy.text')}
        </OLText>

        <View style={{ marginHorizontal: px(32) }}>
          <OLPlusFeature
            featured={feature === 'followRunner'}
            title={t('plus.buy.feature.follow.title')}
            text={t('plus.buy.feature.follow.text')}
          />

          <OLPlusFeature
            featured={feature === 'followClass'}
            title={t('plus.buy.feature.classes.title')}
            text={t('plus.buy.feature.classes.text')}
          />

          <OLPlusFeature
            featured={feature === 'followClub'}
            title={t('plus.buy.feature.clubs.title')}
            text={t('plus.buy.feature.clubs.text')}
          />

          <OLPlusFeature
            featured={feature === 'sorting'}
            title={t('plus.buy.feature.sorting.title')}
            text={t('plus.buy.feature.sorting.text')}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: px(16),
          }}
        >
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
                );
              }}
              style={{ marginRight: px(8) }}
            >
              <OLText size={14}>{t('plus.buy.terms')}</OLText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('https://liveol.larsendahl.se/#privacy');
            }}
          >
            <OLText size={14}>{t('plus.buy.privacy')}</OLText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={{
          paddingTop: px(16),
          paddingHorizontal: px(16),
          marginBottom: px(32),
          backgroundColor: 'white',
          width: '100%',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { height: -8, width: 0 },
          shadowRadius: 4,
          borderTopColor: 'rgba(0,0,0,.15)',
          borderTopWidth: 1,
        }}
      >
        <OLButton onPress={onBuy} disabled={loading}>
          {!loading ? `${price} ${t('plus.buy.yearly')}` : '...'}
        </OLButton>

        <TouchableOpacity onPress={onRestore} style={{ paddingTop: px(16) }}>
          <OLText size={16} style={{ textAlign: 'center' }}>
            {t('plus.buy.restore')}
          </OLText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
