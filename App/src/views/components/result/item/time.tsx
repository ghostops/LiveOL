import * as React from 'react';
import { OLText } from '../../text';
import { useStatusI18n } from '~/hooks/useStatusI18n';
import { timestampToString } from '~/util/time';
import { TextStyle } from 'react-native';

interface Props {
  time?: number | null;
  status?: number | null;
  style?: TextStyle;
}

export const OLResultTime: React.FC<Props> = ({ time, status, style }) => {
  const statusText = useStatusI18n(status);
  const t = timestampToString(time || 0);
  return (
    <OLText size={16} style={style}>
      {status === 0 ? t : statusText}
    </OLText>
  );
};
