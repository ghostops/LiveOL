import React from 'react';
import { OlResult } from 'lib/graphql/generated/types';
import { OLRefetcher } from 'views/components/refetcher';
import { OLResultsList } from 'views/components/result/list';

interface Props {
  refetch: () => Promise<void>;
  results: OlResult[];
  competitionId: number;
  clubName: string;
}

export const OLClubResults: React.FC<Props> = ({
  clubName,
  competitionId,
  refetch,
  results,
}) => {
  return (
    <>
      <OLRefetcher interval={15000} refetch={refetch} />

      <OLResultsList
        results={results}
        competitionId={competitionId}
        className={clubName}
        club
      />
    </>
  );
};
