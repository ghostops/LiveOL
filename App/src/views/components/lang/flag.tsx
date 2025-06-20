import * as React from 'react';
import { Image, ImageStyle } from 'react-native';

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
};

const FLAGS: Record<string, any> = {
  se: require('../../../../assets/images/flags/se.png'),
  no: require('../../../../assets/images/flags/no.png'),
  gb: require('../../../../assets/images/flags/gb.png'),
  rs: require('../../../../assets/images/flags/rs.png'),
  it: require('../../../../assets/images/flags/it.png'),
  cz: require('../../../../assets/images/flags/cz.png'),
  de: require('../../../../assets/images/flags/de.png'),
  es: require('../../../../assets/images/flags/es.png'),
};

export const OLFlag: React.FC<Props> = ({ code, size, style }) => {
  if (!code) {
    return null;
  }

  const flag = FLAGS[remapCode[code]];

  if (!flag) {
    return null;
  }
  return (
    <Image
      source={flag}
      style={{
        height: size * 0.65,
        width: size,
        ...style,
      }}
    />
  );
};
