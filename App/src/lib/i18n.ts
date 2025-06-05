import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languageDetectorPlugin } from './detectI18n';

export enum SupportedLocale {
  en = 'en',
  sv = 'sv',
  no = 'no',
  sr = 'sr',
  it = 'it',
  de = 'de',
  cs = 'cs',
  es = 'es',
}

const locales: Record<SupportedLocale, any> = {
  en: require('../../assets/locales/en.json'),
  sv: require('../../assets/locales/sv.json'),
  no: require('../../assets/locales/no.json'),
  sr: require('../../assets/locales/sr.json'),
  it: require('../../assets/locales/it.json'),
  de: require('../../assets/locales/de.json'),
  cs: require('../../assets/locales/cs.json'),
  es: require('../../assets/locales/es.json'),
};

const resources = Object.keys(locales).reduce((root, locale) => {
  return Object.assign(root, {
    [locale]: { translation: locales[locale as SupportedLocale] },
  });
}, {});

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources,
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
