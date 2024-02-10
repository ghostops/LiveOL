import { LiveresultatApi } from 'lib/liveresultat/types';

export interface IOLPassing {
  id: string;
  class: string;
  control: number;
  controlName: string;
  passtime: string;
  runnerName: string;
  time: string;
  status: number;
}

export const marshallPassing = (res: LiveresultatApi.passing): IOLPassing => {
  let status = 0;

  if (!res.time.includes(':')) {
    switch (res.time) {
      case 'ej start':
        status = 1;
        break;
      case 'utgått':
        status = 2;
        break;
      case 'återbud':
        status = 11;
        break;
      case 'uppflyttad':
        status = 12;
        break;
      case 'ej startat':
        status = 10;
        break;
      case 'felst.':
        status = 3;
        break;
      case 'diskv.':
        status = 4;
        break;
      case 'ö. maxtid':
        status = 5;
        break;
      case 'godkänd':
      default:
        status = 0;
        break;
    }
  }

  return {
    id: `${res.class.replace(/ /g, '_')}:${res.runnerName.replace(/ /g, '_')}:${res.time.replace(/ /g, '_')}`.toLowerCase(),
    class: res.class,
    controlName: res.controlName,
    control: res.control,
    passtime: res.passtime,
    runnerName: res.runnerName,
    time: res.time,
    status,
  };
};
