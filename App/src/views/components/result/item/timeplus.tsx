import { useStatusI18n } from '~/hooks/useStatusI18n';
import * as React from 'react';
import { OLText } from '../../text';
import { timestampToString } from '~/util/time';
import { TextStyle } from 'react-native';

interface Props {
  timeplus: number | null | undefined;
  status: number | null | undefined;
  style?: TextStyle;
}

export const OLResultTimeplus: React.FC<Props> = ({
  timeplus,
  status,
  style,
}) => {
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
    <OLText
      style={{ textAlign: 'left', ...style }}
      size={status === 0 ? 14 : 10}
    >
      {status === 0 ? `+${t}` : `(${statusText})`}
    </OLText>
  );
};
