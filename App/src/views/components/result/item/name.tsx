import * as React from 'react';
import { OLText } from '../../text';

interface Props {
  name: string;
}

export const OLResultName: React.FC<Props> = ({ name }) => (
  <OLText
    numberOfLines={1}
    size={16}
    font="Proxima Nova Regular"
    style={{
      textAlign: 'left',
    }}
  >
    {name}
  </OLText>
);
