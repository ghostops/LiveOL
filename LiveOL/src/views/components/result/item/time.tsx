import * as React from 'react';
import { OLText } from '../../text';
import { useStatusI18n } from 'hooks/useStatusI18n';

interface Props {
  time: string;
  status: number;
}

export const OLResultTime: React.FC<Props> = ({ time, status }) => {
  const statusText = useStatusI18n(status);
  return (
    <OLText font="Proxima Nova Regular" size={20}>
      {status === 0 ? time : statusText}
    </OLText>
  );
};
