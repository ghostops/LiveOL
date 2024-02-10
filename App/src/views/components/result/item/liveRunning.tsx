import { diffDateNow } from '~/util/date';
import { View } from 'react-native';
import { OLText } from '~/views/components/text';
import { useLiveRunningStore } from '~/store/liveRunning';
import { useEffect, useState } from 'react';

interface Props {
  date: string;
}

export const OLResultLiveRunning: React.FC<Props> = ({ date }) => {
  const tick = useLiveRunningStore(state => state.tick);
  const [value, setValue] = useState<string | null>();

  useEffect(() => {
    const time = diffDateNow(date);
    setValue(time);
  }, [tick, date]);

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
