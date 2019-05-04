import { AsyncStorage } from 'react-native';
import { Localization } from 'expo-localization';
import * as _ from 'lodash';

const LOCALES = {
    en: require('../../../assets/locales/en.json'),
    sv: require('../../../assets/locales/sv.json'),
    no: require('../../../assets/locales/no.json'),
};

class Language {
    private key: string = 'OL:LANG';
    public active: AvailibleLanguage = null;
    public fallaback: AvailibleLanguage = 'en';
    public phoneLocale: string;

    public availible: AvailibleLanguage[] = ['en', 'sv', 'no'];

    public init = async (): Promise<void> => {
        this.phoneLocale = Localization.locale.substr(0, 2);

        const cached = await AsyncStorage.getItem(this.key);

        if (cached) {
            this.active = cached as AvailibleLanguage;
        } else {
            if ((this.availible as string[]).indexOf(this.phoneLocale) > -1) {
                this.active = this.phoneLocale as AvailibleLanguage;
            } else {
                this.active = this.fallaback;
            }
        }
    }

    public set = async (lang: AvailibleLanguage): Promise<AvailibleLanguage> => {
        this.active = lang;
        await AsyncStorage.setItem(this.key, lang);
        return lang;
    }

    public print = (key: string): string => {
        return _.get(LOCALES, `${this.active}.${key}`, _.get(LOCALES[this.fallaback], key));
    }
}

export default new Language();
