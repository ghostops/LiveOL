import { View } from 'react-native';
import { paths } from '~/lib/react-query/schema';
import { OLText } from '~/views/components/text';

interface Props {
  split: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'][0]['splits'][0];
  best?: boolean;
}

const BEST_COLOR = '#EA2027';

export const OLSplits: React.FC<Props> = ({ split, best }) => {
  // If the place is 0 the runner hasn't passed the split yet
  if (split.place === 0) {
    return null;
  }

  return (
    <View>
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
