import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageDetectorAsyncModule } from 'i18next';
import { NativeModules, Platform } from 'react-native';

const languageKey = 'language';

export const getDeviceLang = () => {
  const appLanguage =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      : NativeModules.I18nManager.localeIdentifier;

  return appLanguage.search(/-|_/g) !== -1
    ? appLanguage.slice(0, 2)
    : appLanguage;
};

export const languageDetectorPlugin: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    const deviceLang = getDeviceLang();

    try {
      const selectedLang = await AsyncStorage.getItem(languageKey);

      if (selectedLang) {
        return callback(selectedLang);
      } else {
        return callback(deviceLang);
      }
    } catch (error) {
      return callback(deviceLang);
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(languageKey, language);
    } catch (error) {}
  },
};
