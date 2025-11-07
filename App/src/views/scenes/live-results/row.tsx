import { useState, useEffect } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultBadge } from '~/views/components/result/item/badge';
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
    place: deviceWidth * 0.1,
    name: deviceWidth * 0.6,
    time: deviceWidth * 0.3,
    splits: deviceWidth * 0.3,
    start: deviceWidth * 0.3,
  };
};

type Props = {
  liveResultItem: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLLiveResultRow = ({ liveResultItem }: Props) => {
  const { colors } = useTheme();
  const { place, name, time, splits, start } = useRowWidths();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: place }}>
        <OLText>
          <OLResultBadge place={liveResultItem.place} />
        </OLText>
      </View>
      <View style={{ width: name }}>
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
      <View style={{ width: time, gap: 4, alignItems: 'flex-end' }}>
        <OLResultTime
          status={liveResultItem.status}
          time={liveResultItem.result}
        />

        <OLResultTimeplus
          status={liveResultItem.status}
          timeplus={liveResultItem.timeplus}
        />
      </View>
      <View style={{ width: start, alignItems: 'flex-end', paddingRight: 16 }}>
        <OLText>{liveResultItem.start}</OLText>
      </View>
    </View>
  );
};
