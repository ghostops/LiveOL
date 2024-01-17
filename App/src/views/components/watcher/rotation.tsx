import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { useDeviceRotationStore } from '~/store/deviceRotation';

const screen = Dimensions.get('screen');

type Props = {
  children: React.ReactNode;
};

export const OLRotationWatcher: React.FC<Props> = ({ children }) => {
  const { setRotation } = useDeviceRotationStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dimensions, setDimensions] = useState({ screen });

  React.useEffect(() => {
    const onChange = ({ screen: innerScreen }: any) => {
      setRotation(
        innerScreen.height >= innerScreen.width ? 'portrait' : 'landscape',
      );

      setDimensions({ screen });
    };

    setRotation(screen.height >= screen.width ? 'portrait' : 'landscape');
    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription.remove();
  }, [setRotation]);

  return <>{children}</>;
};
