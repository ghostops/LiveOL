import { useEffect } from 'react';
import { useLiveRunningStore } from '~/store/liveRunning';

export const useTicker = () => {
  const startTicking = useLiveRunningStore(state => state.startTicking);
  const stopTicking = useLiveRunningStore(state => state.stopTicking);

  useEffect(() => {
    startTicking();

    return () => {
      stopTicking();
    };
  }, [startTicking, stopTicking]);
};
