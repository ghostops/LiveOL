import * as React from 'react';
import { View } from 'react-native';
import { COLORS } from '~/util/const';
import { OLText } from '../../../components/text';

interface Props {
  place?: number;
}

export const OLResultBadge: React.FC<Props> = ({ place }) => (
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    }}
  >
    {Boolean(place && place > 0) && (
      <View
        style={{
          backgroundColor: COLORS.MAIN,
          justifyContent: 'center',
          alignItems: 'center',
          width: 25,
          height: 25,
          borderRadius: 50,
        }}
      >
        <OLText size={12} style={{ color: 'white' }}>
          {place}
        </OLText>
      </View>
    )}
  </View>
);
