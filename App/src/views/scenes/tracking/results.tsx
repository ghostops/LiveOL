import { RouteProp, useRoute } from '@react-navigation/native';
import { FlatList, View } from 'react-native';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLTrackingResultRow } from './row';
import { OLResultHeader } from '../live-results/result-header';

export const OLSceneTrackingResults = () => {
  const {
    params: { trackingId },
  } = useRoute<RouteProp<RootStack, 'TrackingResults'>>();

  const { data } = $api.useQuery(
    'get',
    '/v2/results/live/tracked/{trackingId}',
    {
      params: { path: { trackingId } },
    },
  );

  return (
    <View>
      <OLResultHeader />
      <FlatList
        data={data?.data.results}
        keyExtractor={item => item.liveResultId}
        renderItem={({ item }) => <OLTrackingResultRow result={item} />}
      />
    </View>
  );
};
