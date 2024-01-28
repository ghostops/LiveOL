import { OLClubResults as Component } from './component';
import { OLLoading } from '~/views/components/loading';
import { OLError } from '~/views/components/error';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { trpc } from '~/lib/trpc/client';

export const OLClubResults: React.FC = () => {
  const {
    params: { clubName, competitionId },
  } = useRoute<RouteProp<RootStack, 'Club'>>();

  const getClubResultsQuery = trpc.getClubResults.useQuery({
    clubName,
    competitionId,
  });

  if (getClubResultsQuery.error) {
    return (
      <OLError
        error={getClubResultsQuery.error}
        refetch={getClubResultsQuery.refetch}
      />
    );
  }

  if (getClubResultsQuery.isLoading) {
    return <OLLoading />;
  }

  return (
    <Component
      results={getClubResultsQuery.data || []}
      refetch={async () => {
        await getClubResultsQuery.refetch();
      }}
      clubName={clubName}
      competitionId={competitionId}
      loading={getClubResultsQuery.isLoading}
    />
  );
};
