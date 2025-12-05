import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';

export const useNotifyOnUpdate = (hash: string | null | undefined) => {
  const previousHash = useRef<string | null | undefined>(undefined);
  const focus = useIsFocused();

  useEffect(() => {
    if (
      focus &&
      hash &&
      previousHash.current &&
      hash !== previousHash.current
    ) {
      Vibration.vibrate();
      __DEV__ && console.log('[vibrated]');
    }
    previousHash.current = hash;
  }, [hash, focus]);
};
