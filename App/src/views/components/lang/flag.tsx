import * as React from 'react';
import { Image } from 'react-native';

interface Props {
    code: string;
    size: number;
}

const remapCode = {
    en: 'gb',
    sv: 'se',
    no: 'no',
};

const FLAGS = {
    se: require('../../../../assets/images/flags/se.png'),
    no: require('../../../../assets/images/flags/no.png'),
    gb: require('../../../../assets/images/flags/gb.png'),
};

export const OLFlag: React.FC<Props> = ({ code, size }) => (
    FLAGS[remapCode[code]] ?
    <Image
        source={FLAGS[remapCode[code]]}
        style={{
            height: size * .65,
            width: size,
        }}
    /> : null
);
