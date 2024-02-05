import { LiveresultatApi } from 'lib/liveresultat/types';

export interface IOLClass {
  id: string;
  name: string;
  competition: number;
}

export const marshallClass =
  (id: number) =>
  (res: LiveresultatApi._class): IOLClass => {
    return {
      id: `${id}:${res.className}`,
      competition: id,
      name: res.className,
    };
  };
