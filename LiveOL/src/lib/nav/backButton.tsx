import React, { useEffect, useState } from 'react';
import { useTheme } from 'hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { OLIcon } from 'views/components/icon';
import { OLText } from 'views/components/text';
import { useOLNavigation } from 'hooks/useNavigation';

export const BackButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const { t } = useTranslation();
  const { fontPx } = useTheme();
  const { goBack, canGoBack } = useOLNavigation();

  useEffect(() => {
    const show = canGoBack();
    setShowButton(show);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showButton) {
    return null;
  }

  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={() => goBack()}>
      <OLIcon
        name="chevron-back"
        color="#fff"
        style={{ fontSize: 20, paddingRight: fontPx(4) }}
      />
      <OLText font="Proxima Nova Regular" size={18} style={{ color: '#fff' }}>
        {t('back')}
      </OLText>
    </TouchableOpacity>
  );
};
