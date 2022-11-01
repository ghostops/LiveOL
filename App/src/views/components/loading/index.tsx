import * as React from 'react';
import { COLORS } from 'util/const';
import { ActivityIndicator, View } from 'react-native';

export const OLLoading: React.FC = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <ActivityIndicator size="large" color={COLORS.MAIN} />
  </View>
);
