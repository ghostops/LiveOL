import * as React from 'react';
import { View } from 'react-native';
import { OLText } from '../../text';
import { padTime, timestampToObject } from '~/util/time';

interface Props {
  time?: number;
}

export const OLStartTime: React.FC<Props> = ({ time }) => {
  const t = timestampToObject(time || 0);
  return (
    <View>
      <OLText size={16}>
        {padTime(t.hours, 2)}:{padTime(t.minutes, 2)}:{padTime(t.seconds, 2)}
      </OLText>
    </View>
  );
};
