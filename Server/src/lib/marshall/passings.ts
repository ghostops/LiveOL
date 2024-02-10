import { LiveresultatApi } from 'lib/liveresultat/types';

export interface IOLPassing {
  id: string;
  class: string;
  control: number;
  controlName: string;
  passtime: string;
  runnerName: string;
  // is sometimes a string, but should be an int for successful checks
  time: string;
}

export const marshallPassing = (res: LiveresultatApi.passing): IOLPassing => {
  return {
    id: `${res.class.replace(/ /g, '_')}:${res.runnerName.replace(/ /g, '_')}:${res.time.replace(/ /g, '_')}`.toLowerCase(),
    class: res.class,
    controlName: res.controlName,
    control: res.control,
    passtime: res.passtime,
    runnerName: res.runnerName,
    time: res.time,
  };
};
