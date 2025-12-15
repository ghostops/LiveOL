import { TouchableOpacity, View } from 'react-native';
import { OLFlag } from './flag';
import { OLButton } from '~/views/components/button';
import { useTranslation } from 'react-i18next';
import { OLIcon } from '~/views/components/icon';
import { useOLNavigation } from '~/hooks/useNavigation';

export const PickerButton = () => {
  const { t } = useTranslation();
  const { navigate } = useOLNavigation();
  return (
    <OLButton onPress={() => navigate('Language')}>
      {t('Pick language')}
    </OLButton>
  );
};

export const PickerIcon = () => {
  const { navigate } = useOLNavigation();
  const { i18n } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => navigate('Language')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
        }}
        hitSlop={{ bottom: 20, left: 20, right: 40, top: 20 }}
      >
        <OLIcon name="earth-outline" size={24} color="black" />
        <OLFlag
          code={i18n.resolvedLanguage}
          size={24}
          style={{ borderColor: 'black', borderWidth: 1, marginLeft: 6 }}
        />
      </TouchableOpacity>
    </View>
  );
};
