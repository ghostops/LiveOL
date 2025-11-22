import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { OLTrackingDropdown } from './dropdown';

export const OLClubsTrackingInput = ({
  onAddClub,
}: {
  onAddClub: (club: string) => void;
}) => {
  const { px } = useTheme();

  const { data } = $api.useQuery('get', '/v2/strings/organizations', {});

  const addClub = (clubInput: string) => {
    onAddClub(clubInput);
  };

  return (
    <View style={{ flexDirection: 'row', gap: px(4) }}>
      <OLTrackingDropdown
        dataSet={data?.data.organizations || null}
        onAddItem={addClub}
      />
    </View>
  );
};
