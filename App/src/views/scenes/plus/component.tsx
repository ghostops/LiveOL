import React from 'react';
import { useTheme } from 'hooks/useTheme';
import { TouchableOpacity, View } from 'react-native';
import { OLText } from 'views/components/text';
import { OLButton } from 'views/components/button';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        paddingTop: px(16),
        backgroundColor: 'white',
        flex: 1,
        paddingBottom: bottom,
      }}
    >
      <View style={{ flex: 1 }}>
        <OLText bold size={28} style={{ textAlign: 'center', margin: px(16) }}>
          {t('plus.buy.title')}
        </OLText>

        <OLText
          size={16}
          style={{ textAlign: 'center', marginHorizontal: px(16) }}
        >
          {t('plus.buy.text')}
        </OLText>
      </View>

      <View
        style={{
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
