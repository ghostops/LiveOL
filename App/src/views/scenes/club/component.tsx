import React from 'react';
import { OlResult } from '~/lib/graphql/generated/types';
import { OLRefetcher } from '~/views/components/refetcher';
import { OLResultsList } from '~/views/components/result/list';
import { OLResultsTable } from '~/views/components/result/table';
import { useDeviceRotationStore } from '~/store/deviceRotation';

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
  const { isLandscape } = useDeviceRotationStore();

  return (
    <>
      <OLRefetcher interval={15000} refetch={refetch} />

      {isLandscape ? (
        <OLResultsTable
          results={results}
          competitionId={competitionId}
          className={clubName}
          club
        />
      ) : (
        <OLResultsList
          results={results}
          competitionId={competitionId}
          className={clubName}
          club
        />
      )}
    </>
  );
};
