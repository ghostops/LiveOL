import { useEffect } from 'react';
import { Vibration } from 'react-native';

export const useNotifyOnUpdate = (latestUpdate: string | null | undefined) => {
  useEffect(() => {
    console.log({ latestUpdate });
    if (latestUpdate) {
      Vibration.vibrate();
      __DEV__ && console.log('[vibrated]');
    }
  }, [latestUpdate]);
};
