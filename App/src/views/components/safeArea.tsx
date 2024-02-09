import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactElement | React.ReactElement[];
  style?: ViewStyle;
};

export const OLSafeAreaView: React.FC<Props> = ({ children, style }) => {
  const safeArea = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          paddingLeft: safeArea.left,
          paddingRight: safeArea.right,
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
