import type { PushEvent } from './notifier';

type Strings = {
  finished: (className: string, time: string, place: string | null) => string;
  status: Record<number, string>;
  statusLine: (className: string, status: string) => string;
  split: (
    className: string,
    control: string,
    time: string | null,
    place: number | null,
  ) => string;
  started: (className: string) => string;
  placeChange: (className: string, place: string) => string;
};

const en: Strings = {
  finished: (c, time, place) =>
    `Finished ${c} in ${time}${place ? `, place ${place}` : ''}`,
  status: {
    1: 'Did not start',
    2: 'Did not finish',
    3: 'Mispunch',
    4: 'Disqualified',
    5: 'Over max time',
  },
  statusLine: (c, status) => `${c}: ${status}`,
  split: (c, control, time, place) =>
    `${c}: passed ${control}${time ? ` at ${time}` : ''}${place ? ` (place ${place})` : ''}`,
  started: c => `Started in ${c}`,
  placeChange: (c, place) => `Now place ${place} in ${c}`,
};

const sv: Strings = {
  finished: (c, time, place) =>
    `Gick i mål i ${c} på ${time}${place ? `, placering ${place}` : ''}`,
  status: {
    1: 'Ej start',
    2: 'Utgått',
    3: 'Felstämplat',
    4: 'Diskvalificerad',
    5: 'Maxtid överskriden',
  },
  statusLine: (c, status) => `${c}: ${status}`,
  split: (c, control, time, place) =>
    `${c}: passerade ${control}${time ? ` på ${time}` : ''}${place ? ` (placering ${place})` : ''}`,
  started: c => `Har startat i ${c}`,
  placeChange: (c, place) => `Nu på plats ${place} i ${c}`,
};

const strings: Record<string, Strings> = { en, sv };

/** Liveresultat times are in hundredths of a second. */
export const formatRaceTime = (hundredths: number | null | undefined) => {
  if (typeof hundredths !== 'number' || hundredths <= 0) return null;
  const totalSeconds = Math.floor(hundredths / 100);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export const buildMessage = (
  event: PushEvent,
  language: string,
  competitionName: string | null,
): { title: string; body: string } => {
  const t = strings[language.split('-')[0]!] ?? en;
  const c = event.className;

  let line: string;
  switch (event.type) {
    case 'finish':
      line = t.finished(c, formatRaceTime(event.result) ?? '-', event.place);
      break;
    case 'status':
      line = t.statusLine(
        c,
        t.status[event.status ?? -1] ?? String(event.status),
      );
      break;
    case 'split':
      line = t.split(
        c,
        event.splitName ?? '',
        formatRaceTime(event.splitTime),
        event.splitPlace ?? null,
      );
      break;
    case 'start':
      line = t.started(c);
      break;
    case 'placeChange':
      line = t.placeChange(c, event.place ?? '-');
      break;
  }

  return {
    title: event.runnerName,
    body: competitionName ? `${line}\n${competitionName}` : line,
  };
};
