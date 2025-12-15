export type StatusLength = 'short' | 'long';

const STATUS_MAP_SHORT: Record<number, string> = {
  0: 'OK',
  1: 'DNS',
  2: 'DNF',
  3: 'MP',
  4: 'DSQ',
  5: 'OT',
  6: '',
  7: '',
  8: '',
  9: '',
  10: '',
  11: 'WO',
  12: 'MU',
  13: 'FIN',
};

const STATUS_MAP_LONG: Record<number, string> = {
  0: 'OKAY',
  1: 'Did Not Start',
  2: 'Did Not Finish',
  3: 'Mispunch',
  4: 'Disqualified',
  5: 'Over Max Time',
  6: '',
  7: '',
  8: '',
  9: '',
  10: '',
  11: 'Walk Over',
  12: 'Moved Up',
  13: 'Finished',
};

export const getStatusKey = (
  status: number | null | undefined,
  length: StatusLength = 'short'
): string | null => {
  if (status === null || status === undefined) {
    return null;
  }

  const map = length === 'short' ? STATUS_MAP_SHORT : STATUS_MAP_LONG;
  return map[status] || '';
};
