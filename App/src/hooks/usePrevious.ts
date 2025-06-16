import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    if (value !== null && value !== undefined) {
      ref.current = value;
    }
  }, [value]);
  return ref.current;
}
