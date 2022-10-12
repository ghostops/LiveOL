import React from 'react';
import _ from 'lodash';
import { OLError } from 'views/components/error';
import { OLCompetition as Component } from './component';
import { useOLNavigation } from 'hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';
import { useGetCompetitionQuery } from 'lib/graphql/generated/gql';
import { OlClass, OlCompetition } from 'lib/graphql/generated/types';

export const OLCompetition: React.FC = () => {
  const { navigate } = useOLNavigation();
  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Competition'>>();

  const { data, loading, error, refetch } = useGetCompetitionQuery({
    variables: { competitionId },
  });

  if (error) {
    return <OLError error={error} refetch={refetch} />;
  }

  const competition: OlCompetition = _.get(
    data,
    'competitions.getCompetition',
    null,
  );

  const classes: OlClass[] = _.get(
    data,
    'competitions.getCompetitionClasses',
    null,
  );

  return (
    <Component
      loading={loading}
      competition={competition}
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
