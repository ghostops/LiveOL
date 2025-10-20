import { Image, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { OLText } from '~/views/components/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '~/util/const';
import { OLIcon } from '~/views/components/icon';

const LOGO = require('../../../../assets/images/icon.png');

export const HomeHeader: React.FC = () => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        height: top + px(50),
        backgroundColor: COLORS.MAIN,
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: px(8),
        }}
      >
        <View>
          <Image
            source={LOGO}
            style={{
              width: 42,
              height: 42,
              marginLeft: px(16),
            }}
            resizeMode="contain"
          />
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <OLText size={18} style={{ color: '#fff' }}>
            {t('home.title')}
          </OLText>
        </View>

        <View style={{ marginRight: px(16) }}>
          <TouchableOpacity onPress={() => {}} hitSlop={16}>
            <OLIcon name="search" color="#fff" style={{ fontSize: 20 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
