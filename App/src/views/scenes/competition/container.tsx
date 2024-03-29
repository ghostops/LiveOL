import { OLError } from '~/views/components/error';
import { OLCompetition as Component } from './component';
import { useOLNavigation } from '~/hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { trpc } from '~/lib/trpc/client';

export const OLCompetition: React.FC = () => {
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Competition'>>();

  const getCompetitionQuery = trpc.getCompetition.useQuery({ competitionId });

  const getCompetitionLastPassingsQuery =
    trpc.getCompetitionLastPassings.useQuery(
      { competitionId },
      { refetchInterval: 15_000 },
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
      competition={getCompetitionQuery.data?.competition}
      classes={getCompetitionQuery.data?.classes}
      goToClass={(className: string | null) => () => {
        if (!className) {
          return;
        }

        navigate('Results', {
          className,
          competitionId,
        });
      }}
      latestPassings={getCompetitionLastPassingsQuery.data}
    />
  );
};
