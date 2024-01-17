import React from 'react';
import { Grid } from 'react-native-easy-grid';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useTextStore } from '~/store/text';

const BASE_SIZE = 60;

export const useOlListItemHeight = () => {
  const { textSizeMultiplier } = useTextStore();
  const { px } = useTheme();

  return px(BASE_SIZE * textSizeMultiplier);
};

type Props = {
  style?: ViewStyle;
  children: React.ReactNode;
};

export const OLResultListItem: React.FC<Props> = ({ children, style }) => {
  const { px } = useTheme();
  const height = useOlListItemHeight();

  return (
    <View
      style={{
        flexDirection: 'row',
        marginLeft: 0,
        borderBottomColor: '#e3e3e3',
        borderBottomWidth: 1,
        paddingRight: px(20),
        height,
        ...style,
      }}
    >
      <Grid>{children}</Grid>
    </View>
  );
};
