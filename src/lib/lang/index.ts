import { AsyncStorage } from 'react-native';
import { i18n } from '../../i18n';
import * as _ from 'lodash';

class Language {
    private key: string = 'OL:LANG';
    public active: AvailibleLanguage = null;
    public fallaback: AvailibleLanguage = 'en';

    public availible: AvailibleLanguage[] = ['en', 'sv'];

    public init = async (): Promise<void> => {
        this.active = (
            await AsyncStorage.getItem(this.key) ||
            this.fallaback
        ) as AvailibleLanguage;
    }

    public set = async (lang: AvailibleLanguage): Promise<AvailibleLanguage> => {
        this.active = lang;
        await AsyncStorage.setItem(this.key, lang);
        return lang;
    }

    public print = (key: string): string => {
        return _.get(i18n, `${this.active}.${key}`, _.get(i18n[this.fallaback], key));
    }
}

export default new Language();
