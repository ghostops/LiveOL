import React from 'react';
import { View } from 'react-native';
import { OLText } from 'views/components/text';
import { OlSplit } from 'lib/graphql/generated/types';

interface Props {
  split: OlSplit;
  best?: boolean;
}

const BEST_COLOR = '#EA2027';

export const OLSplits: React.FC<Props> = ({ split, best }) => {
  // If the place is 0 the runner hasn't passed the split yet
  if (split.place === 0) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <OLText
        bold={best}
        size={16}
        style={{
          color: best ? BEST_COLOR : 'black',
        }}
      >
        {split.time}{' '}
        <OLText
          bold={best}
          size={14}
          style={{
            color: best ? BEST_COLOR : 'gray',
          }}
        >
          ({split.place})
        </OLText>
      </OLText>

      <OLText
        bold={best}
        size={14}
        style={{
          color: best ? BEST_COLOR : 'gray',
        }}
      >
        {split.timeplus}
      </OLText>
    </View>
  );
};
