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
  en: { translation: require('../../assets/locales/en.json') },
  sv: { translation: require('../../assets/locales/sv.json') },
  no: { translation: require('../../assets/locales/no.json') },
  sr: { translation: require('../../assets/locales/sr.json') },
  it: { translation: require('../../assets/locales/it.json') },
  de: { translation: require('../../assets/locales/de.json') },
  cs: { translation: require('../../assets/locales/cs.json') },
  es: { translation: require('../../assets/locales/es.json') },
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
