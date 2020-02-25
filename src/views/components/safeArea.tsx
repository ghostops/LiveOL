import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export const OLSafeAreaView: React.SFC = ({ children }) => {
    return (
        <SafeAreaView>
            {children}
        </SafeAreaView>
    );
};
