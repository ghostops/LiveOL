import { useEffect, useState } from 'react';
import Orientation, { OrientationType } from 'react-native-orientation-locker';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType>(
    OrientationType.PORTRAIT,
  );

  useEffect(() => {
    const initial = Orientation.getInitialOrientation();
    setOrientation(initial);

    const listener = (ori: OrientationType) => {
      setOrientation(ori);
    };

    Orientation.addOrientationListener(listener);
    return () => Orientation.removeOrientationListener(listener);
  }, []);

  return orientation;
};
