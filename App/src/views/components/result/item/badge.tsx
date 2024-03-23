import * as React from 'react';
import { View } from 'react-native';
import { COLORS } from '~/util/const';
import { OLText } from '../../../components/text';
import { useTextStore } from '~/store/text';

interface Props {
  place?: string;
  isShared?: boolean;
}

export const OLResultBadge: React.FC<Props> = ({ place }) => {
  const { textSizeMultiplier } = useTextStore();
  const size = 25 * textSizeMultiplier;
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      {Boolean(place) && (
        <View
          style={{
            backgroundColor: COLORS.MAIN,
            justifyContent: 'center',
            alignItems: 'center',
            width: size,
            height: size,
            borderRadius: 999,
          }}
        >
          <OLText size={12} style={{ color: 'white' }}>
            {place}
          </OLText>
        </View>
      )}
    </View>
  );
};
