import { useEffect } from 'react';
import { useLiveRunningStore } from '~/store/liveRunning';
import { useOLNavigation } from './useNavigation';

export const useTicker = () => {
  const navigation = useOLNavigation();
  const startTicking = useLiveRunningStore(state => state.startTicking);
  const stopTicking = useLiveRunningStore(state => state.stopTicking);

  useEffect(() => {
    startTicking();

    return () => {
      const tickingScreenActive = navigation.getState().routes.some(route => {
        const routeName = route.name;
        return (
          routeName === 'LiveResults' ||
          routeName === 'ClubResults' ||
          routeName === 'TrackingResults'
        );
      });

      if (!tickingScreenActive) {
        stopTicking();
      }
    };
  }, [startTicking, stopTicking, navigation]);
};
