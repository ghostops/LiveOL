import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { COLORS } from '~/util/const';

export const OLNameTrackingInput = ({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void;
}) => {
  const { px } = useTheme();
  const { t } = useTranslation();

  return (
    <TextInput
      style={{
        borderWidth: 2,
        borderColor: COLORS.MAIN,
        borderRadius: 8,
        height: 50,
        paddingHorizontal: px(12),
        fontSize: 16,
        backgroundColor: COLORS.WHITE,
      }}
      placeholder={t('Enter runner name')}
      placeholderTextColor="#666"
      value={name}
      onChangeText={setName}
      autoCapitalize="words"
      autoCorrect={false}
    />
  );
};
