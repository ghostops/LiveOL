import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Result } from 'lib/graphql/fragments/types/Result';
import { OLClubResults as Component } from './component';
import { OLLoading } from 'views/components/loading';
import { OLError } from 'views/components/error';
import { GET_CLUB_RESULTS } from 'lib/graphql/queries/results';
import _ from 'lodash';
import {
  GetClubResults,
  GetClubResultsVariables,
} from 'lib/graphql/queries/types/GetClubResults';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';

export const OLClubResults: React.FC = () => {
  const {
    params: { clubName, competitionId },
  } = useRoute<RouteProp<RootStack, 'Club'>>();

  const { data, loading, error, refetch } = useQuery<
    GetClubResults,
    GetClubResultsVariables
  >(GET_CLUB_RESULTS, {
    variables: { competitionId, clubName },
  });

  if (error) {
    return <OLError error={error} refetch={refetch} />;
  }

  if (loading) {
    return <OLLoading />;
  }

  const results: Result[] = _.get(data, 'results.getClubResults', null);

  return (
    <Component
      results={results}
      refetch={async () => {
        await refetch({ clubName, competitionId });
      }}
      clubName={clubName}
      competitionId={competitionId}
    />
  );
};
