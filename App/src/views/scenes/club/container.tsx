import { OLClubResults as Component } from './component';
import { OLLoading } from '~/views/components/loading';
import { OLError } from '~/views/components/error';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';

export const OLClubResults: React.FC = () => {
  const {
    params: { clubName, competitionId },
  } = useRoute<RouteProp<RootStack, 'Club'>>();

  const getClubResultsQuery = $api.useQuery(
    'get',
    '/v1/results/{competitionId}/club/{clubName}',
    {
      params: { path: { competitionId, clubName } },
      query: { sorting: 'name:asc' },
    },
  );

  if (getClubResultsQuery.error) {
    console.log(getClubResultsQuery.error);
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
      results={getClubResultsQuery.data?.data.results || []}
      refetch={async () => {
        await getClubResultsQuery.refetch();
      }}
      clubName={clubName}
      competitionId={competitionId}
      loading={getClubResultsQuery.isLoading}
    />
  );
};
