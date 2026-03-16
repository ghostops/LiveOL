import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { useUserIdStore } from '~/store/userId';
import { OLButton } from '~/views/components/button';
import { OLTrackingForm } from '~/views/components/tracking/form';
import { UserProfileFormSkeleton } from './skeleton';

export const UserProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const { navigate } = useOLNavigation();
  const uid = useUserIdStore(state => state.userId);
  const { data, isLoading, isError } = $api.useQuery(
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
    return <UserProfileFormSkeleton />;
  }

  if (isError || !data) {
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

      {Boolean(data.data.tracking?.id && data.data.tracking?.name) && (
        <View style={{ marginTop: px(8) }}>
          <OLButton
            onPress={() => {
              navigate('TrackingResults', {
                trackingId: data.data.tracking!.id,
                title: data.data.tracking!.name,
              });
            }}
          >
            {t('View my races')}
          </OLButton>
        </View>
      )}
    </View>
  );
};
