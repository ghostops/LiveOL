import React from 'react';
import { OLText } from '../../text';

interface Props {
  className: string;
}

export const OLClassName: React.FC<Props> = ({ className }) => {
  return (
    <OLText
      numberOfLines={1}
      size={16}
      style={{
        color: 'grey',
      }}
    >
      {className}
    </OLText>
  );
};
