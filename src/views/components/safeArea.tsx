import * as React from 'react';
import { useSafeArea } from 'react-native-safe-area-context';
import { View } from 'native-base';

export const OLSafeAreaView: React.SFC = ({ children }) => {
    const insets = useSafeArea();

    return (
        <View>
            {children}
        </View>
    );
};
