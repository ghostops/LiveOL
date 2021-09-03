import * as React from 'react';
import { Dimensions } from 'react-native';
import { useSetRecoilState } from 'recoil';
import { deviceRotationAtom } from 'store/deviceRotationAtom';

const screen = Dimensions.get('screen');

export const OLRotationWatcher: React.FC = ({ children }) => {
	const setRotation = useSetRecoilState(deviceRotationAtom);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [dimensions, setDimensions] = React.useState({ screen });

	const onChange = ({ screen }) => {
		setRotation(screen.height >= screen.width ? 'portrait' : 'landscape');
		setDimensions({ screen });
	};

	React.useEffect(() => {
		setRotation(screen.height >= screen.width ? 'portrait' : 'landscape');
		Dimensions.addEventListener('change', onChange);

		return () => {
			Dimensions.removeEventListener('change', onChange);
		};
	}, []);

	return <>{children}</>;
};
