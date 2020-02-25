import * as React from 'react';
import { View } from 'native-base';
import { ViewProps } from 'react-native';

export const OLResultColumn: React.SFC<ViewProps> = (props) => {
    return (
        <View
            {...props}
            style={[
                props.style,
                {
                    height: '100%',
                    justifyContent: 'center',
                },
            ]}
        >
            {props.children}
        </View>
    );
};
