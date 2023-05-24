import * as React from 'react';
import { View } from 'react-native';
import { OLText } from '../../text';

interface Props {
  time: string;
}

export const OLStartTime: React.FC<Props> = ({ time }) => (
  <View>
    <OLText size={16}>{time}</OLText>
  </View>
);
