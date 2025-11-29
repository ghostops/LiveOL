import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { useUserIdStore } from '~/store/userId';
import { OLTrackingForm } from '~/views/components/tracking/form';

export const UserProfileForm: React.FC = () => {
  const { px } = useTheme();
  const uid = useUserIdStore(state => state.userId);
  const { data, isLoading } = $api.useQuery(
    'get',
    '/v2/tracking/self',
    {
      params: {
        query: {
          uid,
        },
      },
    },
    { enabled: !!uid },
  );

  if (isLoading) {
    return null;
  }

  return (
    <View>
      <OLTrackingForm
        isUserMode
        mode={data?.data.tracking !== null ? 'edit' : 'create'}
        initialRunner={data?.data.tracking || undefined}
        trackingId={data?.data.tracking?.id}
        style={{ gap: px(8) }}
      />
    </View>
  );
};
