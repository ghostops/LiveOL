import { ImageStyle } from 'react-native';
import CountryFlag from 'react-native-country-flag';

interface Props {
  code: string | undefined;
  size: number;
  style?: ImageStyle;
}

const remapCode: Record<string, string> = {
  en: 'gb',
  sv: 'se',
  no: 'no',
  sr: 'rs',
  it: 'it',
  cs: 'cz',
  de: 'de',
  es: 'es',
  fr: 'fr',
};

export const OLFlag: React.FC<Props> = ({ code, size, style }) => {
  if (!code) {
    return null;
  }
  return <CountryFlag isoCode={remapCode[code]} size={size} style={style} />;
};
