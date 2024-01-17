import * as React from 'react';
import { diffDateNow } from '~/util/date';
import { View } from 'react-native';
import { OLText } from '~/views/components/text';

interface Props {
  date: string;
}

export const OLResultLiveRunning: React.FC<Props> = ({ date }) => {
  const [value, setValue] = React.useState<string>();

  React.useEffect(() => {
    if (!date) {
      return;
    }

    const interval = setInterval(() => {
      const time = diffDateNow(date);
      setValue(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  if (!value) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <OLText size={18} mono>
        {value}
      </OLText>
    </View>
  );
};
