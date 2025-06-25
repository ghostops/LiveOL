import React, { useState } from 'react';
import { OLTrackRunner as Component } from './component';
import { useLayoutEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { OLTrackingData } from '~/views/components/follow/followSheet';
import { $api } from '~/lib/react-query/api';
import { getToday } from '../home/container';
import { OLError } from '~/views/components/error';
import { OLLoading } from '~/views/components/loading';
import { Alert } from 'react-native';

type TrackRunnerRouteParams = {
  runner: OLTrackingData;
};

export const OLTrackRunner: React.FC = () => {
  const navigation = useNavigation();
  const [todaysDate, setTodaysDate] = useState(getToday());
  const route =
    useRoute<
      RouteProp<{ TrackRunner: TrackRunnerRouteParams }, 'TrackRunner'>
    >();

  const { data, isLoading, error, refetch, isRefetching } = $api.useQuery(
    'get',
    '/v1/track/{id}',
    {
      params: {
        path: { id: route.params.runner.id },
        query: { date: todaysDate },
      },
    },
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.runner.runnerName });
  }, [navigation, route.params.runner.runnerName]);

  if (error) {
    return <OLError error={error} refetch={refetch} />;
  }

  if (isLoading || !data) {
    return <OLLoading />;
  }

  return (
    <Component
      isLoading={isRefetching}
      refresh={() => refetch()}
      results={data.data.results}
      runner={data.data.runner}
      onSetTodaysDate={() => {
        Alert.prompt('Set Date', 'Enter date (YYYY-MM-DD)', date => {
          setTodaysDate(date);
        });
      }}
    />
  );
};
