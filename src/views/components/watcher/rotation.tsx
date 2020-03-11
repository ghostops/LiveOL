import * as React from 'react';
import { ScreenOrientation } from 'expo';
import { connect } from 'react-redux';
import { setRotation } from 'store/stores/general';

interface DispatchProps {
    setRotation: (rotation: ScreenOrientation.Orientation) => void;
}

const Component: React.SFC<DispatchProps> = ({ children, setRotation }) => {
    let subscription;

    const onRotate = (event: ScreenOrientation.OrientationChangeEvent) => {
        setRotation(event.orientationInfo.orientation);
    };

    React.useEffect(
        () => {
            ScreenOrientation.getOrientationAsync()
                .then((o) => setRotation(o.orientation));

            subscription = ScreenOrientation.addOrientationChangeListener(onRotate);

            return () => {
                ScreenOrientation.removeOrientationChangeListener(subscription);
            };
        },
        [],
    );

    return <>{children}</>;
};

const mapDispatchToProps = {
    setRotation,
};

export const OLRotationWatcher = connect(null, mapDispatchToProps)(Component);
