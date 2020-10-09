import * as React from 'react';
import { connect } from 'react-redux';
import { setRotation } from 'store/stores/general';
import { Dimensions } from 'react-native';

interface DispatchProps {
	setRotation: (rotation: string) => void;
}

const screen = Dimensions.get('screen');

const Component: React.FC<DispatchProps> = ({ children, setRotation }) => {
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

const mapDispatchToProps = {
	setRotation,
};

export const OLRotationWatcher = connect(null, mapDispatchToProps)(Component);
