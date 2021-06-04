import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = 'LAUNCH_COUNT';

export const promptStoreReview = async (): Promise<void> => {
	const launchCount = Number(await AsyncStorage.getItem(storageKey)) || 0;

	console.log(launchCount);

	if (await StoreReview.isAvailableAsync()) {
		if (launchCount > 3) {
			await StoreReview.requestReview();
		}
	}

	await AsyncStorage.setItem(storageKey, String(launchCount + 1));
};
