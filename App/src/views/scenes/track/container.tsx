import React from 'react';
import { OLTrackRunner as Component } from './component';
import { useLayoutEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { OLTrackingData } from '~/views/components/follow/followSheet';

type TrackRunnerRouteParams = {
  runner: OLTrackingData;
};

export const OLTrackRunner: React.FC = () => {
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<{ TrackRunner: TrackRunnerRouteParams }, 'TrackRunner'>
    >();

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.runner.runnerName });
  }, [navigation, route.params.runner.runnerName]);
  return <Component />;
};
