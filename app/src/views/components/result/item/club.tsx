import React from 'react';
import { OLText } from '../../text';

interface Props {
  club: string;
}

export const OLResultClub: React.FC<Props> = ({ club }) => {
  return (
    <OLText
      numberOfLines={1}
      size={16}
      style={{
        color: 'grey',
      }}
    >
      {club}
    </OLText>
  );
};
