import React from 'react';
import { useOLNavigation } from 'hooks/useNavigation';
import { OLButton } from 'views/components/button';
import { useTheme } from 'hooks/useTheme';
import { usePromoStore } from 'store/promo';
import { useIap } from 'lib/iap';
import { TouchableOpacity, View } from 'react-native';
import { OLText } from 'views/components/text';
import { useTranslation } from 'react-i18next';

export const OLHomePromo: React.FC = () => {
  const { t } = useTranslation();
  const { px, colors } = useTheme();
  const { navigate } = useOLNavigation();
  const { displayPromo, setDisplayPromo } = usePromoStore();
  const { plusActive, loading } = useIap();

  if (plusActive || loading) {
    return null;
  }

  if (!displayPromo) {
    return (
      <TouchableOpacity
        style={{ backgroundColor: colors.DARK, paddingVertical: px(8) }}
        onPress={() => navigate('Plus')}
      >
        <OLText bold size={16} style={{ color: 'white', textAlign: 'center' }}>
          LiveOL+
        </OLText>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: px(16),
        borderWidth: 4,
        borderColor: colors.MAIN,
        borderRadius: 8,
        margin: px(8),
      }}
    >
      <OLText
        bold
        italics
        size={22}
        style={{ textAlign: 'center', marginBottom: px(8) }}
      >
        LiveOL+
      </OLText>

      <OLText size={16} style={{ textAlign: 'center', marginBottom: px(16) }}>
        {t('plus.promo.box.text')}
      </OLText>

      <OLButton small onPress={() => navigate('Plus')}>
        {t('plus.promo.box.cta')}
      </OLButton>

      <TouchableOpacity
        style={{ marginTop: px(16) }}
        onPress={() => {
          setDisplayPromo(false);
        }}
      >
        <OLText size={14} style={{ textAlign: 'center' }}>
          {t('close')}
        </OLText>
      </TouchableOpacity>
    </View>
  );
};
