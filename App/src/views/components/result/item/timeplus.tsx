import { useStatusI18n } from '~/hooks/useStatusI18n';
import * as React from 'react';
import { OLText } from '../../text';
import { timestampToString } from '~/util/isLive';

interface Props {
  timeplus: number | null | undefined;
  status: number | null | undefined;
}

export const OLResultTimeplus: React.FC<Props> = ({ timeplus, status }) => {
  const statusText = useStatusI18n(status, 'long');

  if (
    status === null ||
    status === undefined ||
    status < 0 ||
    status === 10 ||
    status === 9
  ) {
    return null;
  }

  const t = timestampToString(timeplus || 0);

  return (
    <OLText style={{}} size={status === 0 ? 14 : 12}>
      {status === 0 ? `+${t}` : `(${statusText})`}
    </OLText>
  );
};
