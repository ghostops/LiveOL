import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { OLTrackingDropdown } from './dropdown';

export const OLClassesTrackingInput = ({
  onAddClass,
}: {
  onAddClass: (className: string) => void;
}) => {
  const { px } = useTheme();

  const { data } = $api.useQuery('get', '/v2/strings/classes', {});

  const addClass = (classInput: string) => {
    onAddClass(classInput);
  };

  return (
    <View style={{ flexDirection: 'row', gap: px(4) }}>
      <OLTrackingDropdown
        dataSet={data?.data.classes || null}
        onAddItem={addClass}
      />
    </View>
  );
};
