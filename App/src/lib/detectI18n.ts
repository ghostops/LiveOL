import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageDetectorAsyncModule } from 'i18next';
import { i18nMap } from './i18nmap';

const languageKey = 'language';

const getCountryLang = async (): Promise<string> => {
  const data = await fetch('https://api.country.is/').then(response =>
    response.json(),
  );

  const lang = data?.country;

  if (!lang) {
    return 'en';
  }

  const langStr = i18nMap[lang];

  if (!langStr) {
    return 'en';
  }

  return langStr.slice(0, 2).toLowerCase();
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
        const deviceLang = await getCountryLang();
        return deviceLang;
      }
    } catch (error) {
      const deviceLang = await getCountryLang();
      return deviceLang;
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(languageKey, language);
    } catch (error) {}
  },
};
