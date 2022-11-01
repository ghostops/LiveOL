import * as React from 'react';
import { OLRefetcher } from 'views/components/refetcher';
import { OLResultsList } from 'views/components/result/list';
import { Result } from 'lib/graphql/fragments/types/Result';

interface Props {
  refetch: () => Promise<void>;
  results: Result[];
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
