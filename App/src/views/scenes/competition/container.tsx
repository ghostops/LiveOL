import { OLError } from '~/views/components/error';
import { OLCompetition as Component } from './component';
import { useOLNavigation } from '~/hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';

export const OLCompetition: React.FC = () => {
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Competition'>>();

  const getCompetitionQuery = $api.useQuery(
    'get',
    '/v1/competitions/{competitionId}',
    {
      params: { path: { competitionId } },
    },
  );

  console.log(getCompetitionQuery.error);

  const getCompetitionLastPassingsQuery = $api.useQuery(
    'get',
    '/v1/competitions/{competitionId}/last-passings',
    {
      params: { path: { competitionId } },
      refetchInterval: 15_000,
    },
  );

  if (getCompetitionQuery.error) {
    return (
      <OLError
        error={getCompetitionQuery.error}
        refetch={getCompetitionQuery.refetch}
      />
    );
  }

  return (
    <Component
      loading={getCompetitionQuery.isLoading}
      competition={getCompetitionQuery.data?.data.competition}
      classes={getCompetitionQuery.data?.data.classes}
      goToClass={(className: string | null) => () => {
        if (!className) {
          return;
        }

        navigate('Results', {
          className,
          competitionId,
        });
      }}
      latestPassings={getCompetitionLastPassingsQuery.data?.data.passings}
    />
  );
};
