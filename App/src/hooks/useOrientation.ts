import { useEffect, useState } from 'react';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ORIENTATION_STORAGE_KEY = '@liveol/orientation';

// Module-level cache for orientation to persist between hook initializations
let cachedOrientation: OrientationType = OrientationType.PORTRAIT;
let isInitialized = false;

// Load persisted orientation on module initialization
AsyncStorage.getItem(ORIENTATION_STORAGE_KEY)
  .then(value => {
    if (value) {
      cachedOrientation = value as OrientationType;
    }
  })
  .catch(() => {
    // Ignore errors, use default
  });

const persistOrientation = async (orientation: OrientationType) => {
  try {
    await AsyncStorage.setItem(ORIENTATION_STORAGE_KEY, orientation);
  } catch {
    // Ignore errors
  }
};

export const useOrientation = () => {
  const [orientation, setOrientation] =
    useState<OrientationType>(cachedOrientation);

  useEffect(() => {
    // Only get initial orientation on first initialization
    if (!isInitialized) {
      const initial = Orientation.getInitialOrientation();
      setOrientation(initial);
      cachedOrientation = initial;
      persistOrientation(initial);
      isInitialized = true;
    }

    const listener = (ori: OrientationType) => {
      setOrientation(ori);
      cachedOrientation = ori;
      persistOrientation(ori);
    };

    Orientation.addOrientationListener(listener);
    return () => Orientation.removeOrientationListener(listener);
  }, []);

  return orientation;
};
