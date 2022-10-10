import React from 'react';
import { useQuery } from '@apollo/client';
import { OLError } from 'views/components/error';
import { OLCompetition as Component } from './component';
import {
  GetCompetition,
  GetCompetitionVariables,
} from 'lib/graphql/queries/types/GetCompetition';
import { GET_COMPETITION } from 'lib/graphql/queries/competitions';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { Class } from 'lib/graphql/fragments/types/Class';
import _ from 'lodash';
import { useOLNavigation } from 'hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';

export const OLCompetition: React.FC = () => {
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Competition'>>();

  const { data, loading, error, refetch } = useQuery<
    GetCompetition,
    GetCompetitionVariables
  >(GET_COMPETITION, {
    variables: { competitionId },
  });

  if (error) {
    return <OLError error={error} refetch={refetch} />;
  }

  const competition: Competition = _.get(
    data,
    'competitions.getCompetition',
    null,
  );
  const classes: Class[] = _.get(
    data,
    'competitions.getCompetitionClasses',
    null,
  );

  return (
    <Component
      loading={loading}
      competition={competition as any}
      classes={classes}
      goToLastPassings={() => {
        navigate('Passings', {
          competitionId,
          title: competition.name || '',
        });
      }}
      goToClass={(className: string | null) => () => {
        if (!className) {
          return;
        }

        navigate('Results', {
          className,
          competitionId,
        });
      }}
    />
  );
};
