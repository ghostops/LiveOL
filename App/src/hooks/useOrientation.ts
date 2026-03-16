import { useEffect, useState } from 'react';
import Orientation, { OrientationType } from 'react-native-orientation-locker';

let cachedOrientation: OrientationType = OrientationType.PORTRAIT;
let isInitialized = false;

export const useOrientation = () => {
  const [orientation, setOrientation] =
    useState<OrientationType>(cachedOrientation);

  useEffect(() => {
    if (!isInitialized) {
      const initial = Orientation.getInitialOrientation();
      setOrientation(initial);
      cachedOrientation = initial;
      isInitialized = true;
    }

    const listener = (ori: OrientationType) => {
      setOrientation(ori);
      cachedOrientation = ori;
    };

    Orientation.addOrientationListener(listener);
    return () => Orientation.removeOrientationListener(listener);
  }, []);

  return orientation;
};
