import { useState, useEffect } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { isLiveRunning } from '~/util/isLive';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultLiveRunning } from '~/views/components/result/item/liveRunning';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLText } from '~/views/components/text';

export const useRowWidths = () => {
  const [deviceWidth, setDeviceWidth] = useState(
    Dimensions.get('window').width,
  );

  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    place: deviceWidth * 0.15,
    name: deviceWidth * 0.6,
    time: deviceWidth * 0.25,
    splits: deviceWidth * 0.25,
  };
};

type Props = {
  liveResultItem: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLLiveResultRow = ({ liveResultItem }: Props) => {
  const { colors } = useTheme();
  const { place, name, time, splits } = useRowWidths();

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
    >
      <View style={{ width: place, alignItems: 'center' }}>
        <OLResultBadge place={liveResultItem.place} />
      </View>
      <View style={{ width: name, paddingRight: 4 }}>
        <OLText numberOfLines={1}>{liveResultItem.name || 'N/A'}</OLText>
        <TouchableOpacity>
          <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
            {liveResultItem.organization}
          </OLText>
        </TouchableOpacity>
      </View>
      {liveResultItem.splitResults?.map(split => (
        <View key={split.code} style={{ width: splits, gap: 4 }}>
          <OLResultTime status={split.status} time={split.time} />
          <OLResultTimeplus status={split.status} timeplus={split.timeplus} />
        </View>
      ))}
      <View
        style={{
          width: time,
          gap: 4,
          alignItems: 'flex-end',
          paddingRight: 8,
        }}
      >
        <OLRowTime liveResultItem={liveResultItem} />
      </View>
    </View>
  );
};

const OLRowTime = ({ liveResultItem }: Props) => {
  if (liveResultItem.start && isLiveRunning(liveResultItem)) {
    return <OLResultLiveRunning startTime={liveResultItem.start} />;
  }

  return (
    <View style={{ gap: 4 }}>
      <OLResultTime
        status={liveResultItem.status}
        time={liveResultItem.result}
      />

      <OLResultTimeplus
        status={liveResultItem.status}
        timeplus={liveResultItem.timeplus}
      />
    </View>
  );
};
