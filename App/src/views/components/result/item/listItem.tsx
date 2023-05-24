import React from 'react';
import { Grid } from 'react-native-easy-grid';
import { View } from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { useTextStore } from 'store/text';

const BASE_SIZE = 60;

export const useOlListItemHeight = () => {
  const { textSizeMultiplier } = useTextStore();
  const { px } = useTheme();

  return px(BASE_SIZE * textSizeMultiplier);
};

type Props = {
  children: React.ReactNode;
};

export const OLResultListItem: React.FC<Props> = ({ children }) => {
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
      }}
    >
      <Grid>{children}</Grid>
    </View>
  );
};
