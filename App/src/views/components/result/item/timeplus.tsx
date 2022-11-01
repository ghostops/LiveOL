import { useStatusI18n } from 'hooks/useStatusI18n';
import * as React from 'react';
import { OLText } from '../../text';

interface Props {
  timeplus: string;
  status: number;
}

export const OLResultTimeplus: React.FC<Props> = ({ timeplus, status }) => {
  const statusText = useStatusI18n(status, 'long');

  if (status < 0 || status === 10 || status === 9) {
    return null;
  }

  return (
    <OLText
      font="Proxima Nova Regular"
      style={{
        textAlign: 'right',
      }}
      size={status === 0 ? 14 : 12}
    >
      {status === 0 ? timeplus : `(${statusText})`}
    </OLText>
  );
};
