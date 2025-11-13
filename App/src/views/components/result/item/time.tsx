import * as React from 'react';
import { OLText } from '../../text';
import { useStatusI18n } from '~/hooks/useStatusI18n';
import { timestampToString } from '~/util/isLive';

interface Props {
  time?: number | null;
  status?: number | null;
}

export const OLResultTime: React.FC<Props> = ({ time, status }) => {
  const statusText = useStatusI18n(status);
  const t = timestampToString(time || 0);
  return <OLText size={16}>{status === 0 ? t : statusText}</OLText>;
};
