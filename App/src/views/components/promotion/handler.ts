import AsyncStorage from '@react-native-async-storage/async-storage';

export const promotion = (name: string) => ({
	canShow: async () => {
		const promo = await AsyncStorage.getItem(`OL:PROMO:${name}`);

		return !promo || promo !== 'true';
	},
	close: async () => {
		await AsyncStorage.setItem(`OL:PROMO:${name}`, 'true');
	},
});
