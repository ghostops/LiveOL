import { useTheme } from '~/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Platform, TouchableOpacity, useColorScheme } from 'react-native';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { HAS_LIQUID_GLASS } from '~/util/const';

type Props = {
  cross?: boolean;
};

export const BackButton: React.FC<Props> = ({ cross }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { fontPx, colors, px } = useTheme();
  const { goBack, canGoBack } = useOLNavigation();

  if (!canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: HAS_LIQUID_GLASS ? px(8) : 0,
      }}
      onPress={() => goBack()}
    >
      <OLIcon
        name={cross ? 'close-outline' : 'chevron-back'}
        color={!isDark && HAS_LIQUID_GLASS ? colors.BLACK : colors.WHITE}
        style={{
          fontSize: fontPx(cross ? 32 : 20),
          top: Platform.OS === 'android' ? 1 : 0,
        }}
      />
      {!cross && (
        <OLText
          size={18}
          style={{
            color: !isDark && HAS_LIQUID_GLASS ? colors.BLACK : colors.WHITE,
          }}
        >
          {t('back')}
        </OLText>
      )}
    </TouchableOpacity>
  );
};
