import { useState, useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { paths } from '~/lib/react-query/schema';
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
    name: deviceWidth * 0.4,
    time: deviceWidth * 0.2,
    splits: 120,
    start: 120,
  };
};

type Props = {
  liveResultItem: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLLiveResultRow = ({ liveResultItem }: Props) => {
  const { place, name, time, splits, start } = useRowWidths();

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: place }}>
        <OLText>
          {liveResultItem.place !== null ? liveResultItem.place : '-'}
        </OLText>
      </View>
      <View style={{ width: name }}>
        <OLText>{liveResultItem.name || 'N/A'}</OLText>
      </View>
      {liveResultItem.splitResults?.map(split => (
        <View key={split.code} style={{ width: splits }}>
          <OLText>{split.time !== null ? split.time : '-'}</OLText>
        </View>
      ))}
      <View style={{ width: time }}>
        <OLText>{liveResultItem.result || 'N/A'}</OLText>
      </View>
      <View style={{ width: start }}>
        <OLText>tbd</OLText>
      </View>
    </View>
  );
};
