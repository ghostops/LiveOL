import * as React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { OLIcon } from 'views/components/icon';
import { useTranslation } from 'react-i18next';
import { OLText } from 'views/components/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from 'util/const';
import { useOLNavigation } from 'hooks/useNavigation';

const LOGO = require('../../../../assets/images/icon.png');

export const HomeHeader: React.FC = () => {
  const { t } = useTranslation();
  const { hitSlop, px } = useTheme();
  const { navigate } = useOLNavigation();
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        height: top + px(50),
        backgroundColor: COLORS.MAIN,
        justifyContent: 'flex-end',
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: px(8),
        }}>
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

        <View>
          <OLText
            font="Proxima-Nova-Bold regular"
            size={18}
            style={{ color: '#fff' }}>
            {t('home.title')}
          </OLText>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => navigate('Info')}
            style={{ marginRight: px(16) }}
            hitSlop={hitSlop}>
            <OLIcon name="md-information-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
