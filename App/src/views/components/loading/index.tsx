import * as React from 'react';
import { COLORS } from 'util/const';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'hooks/useTheme';

type Props = {
  badge?: boolean;
};

export const OLLoading: React.FC<Props> = ({ badge }) => {
  const { px } = useTheme();

  return (
    <View
      style={
        badge
          ? {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }
          : {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }
      }
    >
      <ActivityIndicator
        size={badge ? 'small' : 'large'}
        color={COLORS.MAIN}
        style={
          badge
            ? { backgroundColor: 'white', padding: px(8), borderRadius: 8 }
            : {}
        }
      />
    </View>
  );
};
