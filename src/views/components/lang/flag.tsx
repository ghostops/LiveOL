import * as React from 'react';
import Flag from 'react-native-flags-kit';

interface Props {
    code: string;
    size: number;
}

const remapCode = {
    en: 'GB',
    sv: 'SE',
    no: 'NO',
};

export const OLFlag: React.SFC<Props> = ({ code, size }) => (
    <Flag
        code={remapCode[code]}
        size={size}
    />
);
