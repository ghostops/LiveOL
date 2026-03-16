export const MOCK_RUNNER_NAMES = [
  'Erik Andersson',
  'Sofia Johansson',
  'Lars Karlsson',
  'Anna Lindström',
  'Johan Nilsson',
  'Emma Eriksson',
  'Mikael Larsson',
  'Karin Olsson',
  'Anders Persson',
  'Maria Svensson',
];

export const MOCK_CLUBS = [
  'IFK Lidingö',
  'Göteborg-Majorna',
  'Halden SK',
  'IK Hakarpspojkarna',
  'Sävedalens AIK',
  'OK Ravinen',
  'Växjö OK',
  'IFK Göteborg',
];

export const MOCK_CONTROL_CODES = ['31', '32', '33'];

export const MOCK_CLASS_NAME = 'H21E';

export const MOCK_COMPETITION_PREFIX = '[MOCK]';

export interface MockRunnerData {
  name: string;
  club: string;
}

export const generateMockRunners = (): MockRunnerData[] => {
  return MOCK_RUNNER_NAMES.map((name, index) => {
    const club = MOCK_CLUBS[index % MOCK_CLUBS.length]!;
    return {
      name,
      club,
    };
  });
};
