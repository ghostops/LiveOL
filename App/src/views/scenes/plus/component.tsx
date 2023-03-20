import React from 'react';
import { useTheme } from 'hooks/useTheme';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { OLText } from 'views/components/text';
import { OLButton } from 'views/components/button';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OLIcon } from 'views/components/icon';

type OLPlusFeatureProps = {
  title: string;
  text: string;
};

const OLPlusFeature: React.FC<OLPlusFeatureProps> = ({ text, title }) => {
  const { px } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: px(32),
        paddingHorizontal: px(16),
      }}
    >
      <OLIcon name="checkmark-circle-outline" size={32} />
      <View style={{ paddingLeft: 8 }}>
        <OLText size={20} style={{ marginBottom: px(4) }}>
          {title}
        </OLText>
        <OLText size={16}>{text}</OLText>
      </View>
    </View>
  );
};

type Props = {
  price?: string;
  onBuy?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  loading?: boolean;
};

export const OLPlus: React.FC<Props> = ({
  price,
  onBuy,
  onRestore,
  loading,
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
      <ScrollView style={{ flex: 1, paddingTop: px(16) }}>
        <OLText bold size={28} style={{ textAlign: 'center', margin: px(16) }}>
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

        <OLPlusFeature
          title={t('plus.buy.feature.follow.title')}
          text={t('plus.buy.feature.follow.text')}
        />

        <OLPlusFeature
          title={t('plus.buy.feature.follow.title')}
          text={t('plus.buy.feature.follow.text')}
        />

        <OLPlusFeature
          title={t('plus.buy.feature.follow.title')}
          text={t('plus.buy.feature.follow.text')}
        />

        <OLPlusFeature
          title={t('plus.buy.feature.follow.title')}
          text={t('plus.buy.feature.follow.text')}
        />
      </ScrollView>

      <View
        style={{
          paddingTop: px(16),
          marginHorizontal: px(16),
          marginBottom: px(32),
        }}
      >
        <OLButton onPress={onBuy} disabled={loading}>
          {!loading ? price : '...'}
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
