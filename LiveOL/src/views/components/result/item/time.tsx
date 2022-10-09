import * as React from 'react';
import { statusI18n } from 'lib/lang/status';
import { OLText } from '../../text';

interface Props {
  time: string;
  status: number;
}

export const OLResultTime: React.FC<Props> = ({ time, status }) => {
  return (
    <OLText font="Proxima Nova Regular" size={20}>
      {status === 0 ? time : statusI18n(status)}
    </OLText>
  );
};
