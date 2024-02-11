import { View } from 'react-native';
import { OLText } from '~/views/components/text';
import { useLiveRunningStore } from '~/store/liveRunning';
import { useEffect, useState } from 'react';
import { getLiveRunningTime } from '~/util/isLive';

interface Props {
  startTime: number;
}

export const OLResultLiveRunning: React.FC<Props> = ({ startTime }) => {
  const tick = useLiveRunningStore(state => state.tick);
  const [value, setValue] = useState<string | null>();

  useEffect(() => {
    setValue(getLiveRunningTime(startTime));
  }, [startTime, tick]);

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
