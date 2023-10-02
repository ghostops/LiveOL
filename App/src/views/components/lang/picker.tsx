import * as React from 'react';
import { useTheme } from 'hooks/useTheme';
import { TouchableOpacity, Modal, View, FlatList } from 'react-native';
import { OLFlag } from './flag';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OLText } from 'views/components/text';
import { OLButton } from 'views/components/button';
import { useTranslation } from 'react-i18next';
import { OLIcon } from 'views/components/icon';

type Props = {
  button?: boolean;
};

export const LanguagePicker: React.FC<Props> = ({ button = false }) => {
  const { colors, px } = useTheme();
  const { i18n, t } = useTranslation();
  const [active, setActive] = React.useState(false);
  const safeInsets = useSafeAreaInsets();

  const getCurrentLanguage = (key: string) =>
    (i18n.options.resources as any)[key].translation.currentLanguage;

  return (
    <>
      {!button ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingLeft: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setActive(true)}
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
      ) : (
        <OLButton onPress={() => setActive(true)}>
          {t('language.pick')}
        </OLButton>
      )}

      <Modal visible={active} animationType="slide">
        <View style={safeInsets}>
          <TouchableOpacity
            onPress={() => setActive(false)}
            hitSlop={{ bottom: 20, left: 20, right: 20, top: 20 }}
            style={{ marginLeft: 16 }}
          >
            <OLIcon name="close" size={32} color="black" />
          </TouchableOpacity>

          <FlatList
            data={Object.keys(i18n.options.resources as any)}
            renderItem={({ item: lang }) => {
              return (
                <TouchableOpacity
                  onPress={async () => {
                    i18n.changeLanguage(lang, () => {
                      setActive(false);
                    });
                  }}
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingLeft: px(24),
                    paddingVertical: px(16),
                    backgroundColor:
                      lang === i18n.resolvedLanguage
                        ? colors.MAIN
                        : 'transparent',
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
      </Modal>
    </>
  );
};
