import * as React from 'react';
import { View, Text } from 'native-base';
import { ApolloError } from 'apollo-boost';

export const OLError: React.SFC<{ error?: ApolloError }> = ({ error }) => (
    <View
        style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Text>
            Error
        </Text>
    </View>
);
