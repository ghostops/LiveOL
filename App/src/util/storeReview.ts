import InAppReview from 'react-native-in-app-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = 'LAUNCH_COUNT';

export const promptStoreReview = async (): Promise<void> => {
  const launchCount = Number(await AsyncStorage.getItem(storageKey)) || 0;

  if (InAppReview.isAvailable()) {
    if (launchCount > 3) {
      await InAppReview.RequestInAppReview();
    }
  }

  await AsyncStorage.setItem(storageKey, String(launchCount + 1));
};
