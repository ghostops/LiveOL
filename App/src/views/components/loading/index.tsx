import * as React from 'react';
import { View, Text, Spinner } from 'native-base';
import { ApolloError } from 'apollo-boost';
import { COLORS } from 'util/const';

export const OLLoading: React.SFC = () => (
    <View
        style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Spinner color={COLORS.MAIN} />
    </View>
);
