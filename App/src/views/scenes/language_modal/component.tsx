import { useTranslation } from 'react-i18next';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { OLFlag } from '~/views/components/lang/flag';
import { OLText } from '~/views/components/text';

export const OLLanguageModal = () => {
  const { goBack } = useOLNavigation();
  const { colors, px } = useTheme();
  const { i18n } = useTranslation();

  const getCurrentLanguage = (key: string) =>
    (i18n.options.resources as any)[key].translation.currentLanguage;

  return (
    <View>
      <FlatList
        data={Object.keys(i18n.options.resources as any)}
        renderItem={({ item: lang }) => {
          return (
            <TouchableOpacity
              onPress={async () => {
                i18n.changeLanguage(lang, () => {
                  goBack();
                });
              }}
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                paddingLeft: px(24),
                paddingVertical: px(16),
                backgroundColor:
                  lang === i18n.resolvedLanguage ? colors.MAIN : 'transparent',
              }}
              key={lang}
            >
              <OLFlag
                code={lang}
                size={32}
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  marginRight: px(6),
                }}
              />
              <OLText
                bold={lang === i18n.resolvedLanguage}
                size={16}
                style={{
                  color: lang === i18n.resolvedLanguage ? 'white' : 'black',
                }}
              >
                {getCurrentLanguage(lang)}
              </OLText>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item: string) => item}
        style={{ height: '100%', paddingTop: px(24) }}
      />
    </View>
  );
};
