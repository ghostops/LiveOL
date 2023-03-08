import React from 'react';
import _ from 'lodash';
import { OLClubResults as Component } from './component';
import { OLLoading } from 'views/components/loading';
import { OLError } from 'views/components/error';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';
import { useGetClubResultsQuery } from 'lib/graphql/generated/gql';
import { OlResult } from 'lib/graphql/generated/types';

export const OLClubResults: React.FC = () => {
  const {
    params: { clubName, competitionId },
  } = useRoute<RouteProp<RootStack, 'Club'>>();

  const { data, loading, error, refetch } = useGetClubResultsQuery({
    variables: { competitionId, clubName },
  });

  if (error) {
    return <OLError error={error} refetch={refetch} />;
  }

  if (loading) {
    return <OLLoading />;
  }

  const results: OlResult[] = _.get(data, 'results.getClubResults', null);

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
