import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';

export const useNotifyOnUpdate = (hash: string | null | undefined) => {
  const previousHash = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (hash && previousHash.current && hash !== previousHash.current) {
      Vibration.vibrate();
      __DEV__ && console.log('[vibrated]');
      previousHash.current = hash;
    }
  }, [hash]);
};
