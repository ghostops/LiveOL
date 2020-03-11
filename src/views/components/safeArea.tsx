import * as React from 'react';
import { connect } from 'react-redux';
import { ScreenOrientation } from 'expo';
import { useSafeArea } from 'react-native-safe-area-context';
import { View } from 'native-base';

interface StateProps {
    rotation: ScreenOrientation.Orientation;
}

const Component: React.SFC<StateProps> = ({ children, rotation }) => {
    const insets = useSafeArea();

    return (
        <View
            style={{
                paddingRight: (
                    rotation === ScreenOrientation.Orientation.LANDSCAPE
                    ? insets.right
                    : 0
                ),
                paddingLeft: (
                    rotation === ScreenOrientation.Orientation.LANDSCAPE
                    ? insets.left
                    : 0
                ),
            }}
        >
            {children}
        </View>
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    rotation: state.general.rotation,
});

export const OLSafeAreaView = connect(mapStateToProps, null)(Component);
