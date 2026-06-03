import InAppReview from 'react-native-in-app-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAUNCH_COUNT_KEY = 'LAUNCH_COUNT';
const LAST_REVIEW_KEY = 'LAST_REVIEW_PROMPT_DATE';
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export const promptStoreReview = async (): Promise<void> => {
  const launchCount = Number(await AsyncStorage.getItem(LAUNCH_COUNT_KEY)) || 0;

  if (InAppReview.isAvailable()) {
    if (launchCount > 3) {
      const lastPromptStr = await AsyncStorage.getItem(LAST_REVIEW_KEY);
      const lastPrompt = lastPromptStr ? Number(lastPromptStr) : 0;
      const now = Date.now();

      if (now - lastPrompt > SIX_MONTHS_MS) {
        try {
          await InAppReview.RequestInAppReview();
          await AsyncStorage.setItem(LAST_REVIEW_KEY, String(now));
        } catch (error: any) {
          // Silent errors, what could go wrong?
        }
      }
    }
  }

  await AsyncStorage.setItem(LAUNCH_COUNT_KEY, String(launchCount + 1));
};
