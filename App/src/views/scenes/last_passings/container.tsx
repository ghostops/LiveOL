import { OLPassings as Component } from './component';
import { OLError } from '~/views/components/error';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { RootStack } from '~/lib/nav/router';
import { RouteProp, useRoute } from '@react-navigation/native';
import { trpc } from '~/lib/trpc/client';

export const OLPassings: React.FC = () => {
  const { isLandscape } = useDeviceRotationStore();

  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Passings'>>();

  const getCompetitionLastPassingsQuery =
    trpc.getCompetitionLastPassings.useQuery({ competitionId });

  if (getCompetitionLastPassingsQuery.error) {
    return (
      <OLError
        error={getCompetitionLastPassingsQuery.error}
        refetch={getCompetitionLastPassingsQuery.refetch}
      />
    );
  }

  return (
    <Component
      loading={getCompetitionLastPassingsQuery.isLoading}
      passings={getCompetitionLastPassingsQuery.data || []}
      refresh={async () => {
        await getCompetitionLastPassingsQuery.refetch();
      }}
      landscape={isLandscape}
    />
  );
};
