import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import * as _ from 'lodash';

const LOCALES: any = {
	en: require('../../../assets/locales/en.json'),
	sv: require('../../../assets/locales/sv.json'),
	no: require('../../../assets/locales/no.json'),
	sr: require('../../../assets/locales/sr.json'),
};

class Language {
	private key = 'OL:LANG';
	public active: AvailableLanguage = null;
	public fallback: AvailableLanguage = 'en';
	public phoneLocale: string;

	public available: AvailableLanguage[] = ['en', 'sv', 'no', 'sr'];

	public init = async (): Promise<void> => {
		this.phoneLocale = Localization.locale.substr(0, 2);

		const cached = await AsyncStorage.getItem(this.key);

		if (cached) {
			this.active = cached as AvailableLanguage;
		} else {
			if ((this.available as string[]).indexOf(this.phoneLocale) > -1) {
				this.active = this.phoneLocale as AvailableLanguage;
			} else {
				this.active = this.fallback;
			}
		}
	};

	public set = async (lang: AvailableLanguage): Promise<AvailableLanguage> => {
		this.active = lang;
		await AsyncStorage.setItem(this.key, lang);
		return lang;
	};

	public print = (key: string): string => {
		return _.get<string>(LOCALES, `${this.active}.${key}`, _.get(LOCALES[this.fallback], key, key));
	};
}

export const Lang = new Language();
