import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageDetectorAsyncModule } from 'i18next';
import { getLocales } from 'react-native-localize';

const languageKey = 'language';

const getCountryLang = () => {
  const locales = getLocales();
  const locale = locales[0];

  if (!locale) {
    return 'en';
  }

  return locale.languageCode;
};

export const languageDetectorPlugin: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async () => {
    try {
      const selectedLang = await AsyncStorage.getItem(languageKey);

      if (selectedLang) {
        return selectedLang;
      } else {
        const deviceLang = getCountryLang();
        return deviceLang;
      }
    } catch (error) {
      const deviceLang = getCountryLang();
      return deviceLang;
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(languageKey, language);
    } catch (error) {}
  },
};
