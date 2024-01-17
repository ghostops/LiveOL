import React from 'react';
import { useTheme } from '~/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Platform, TouchableOpacity } from 'react-native';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';

type Props = {
  cross?: boolean;
};

export const BackButton: React.FC<Props> = ({ cross }) => {
  const { t } = useTranslation();
  const { fontPx } = useTheme();
  const { goBack, canGoBack } = useOLNavigation();

  if (!canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => goBack()}
    >
      <OLIcon
        name={cross ? 'close-outline' : 'chevron-back'}
        color="#fff"
        style={{
          fontSize: fontPx(cross ? 32 : 20),
          top: Platform.OS === 'android' ? 1 : 0,
        }}
      />
      {!cross && (
        <OLText size={18} style={{ color: '#fff' }}>
          {t('back')}
        </OLText>
      )}
    </TouchableOpacity>
  );
};
