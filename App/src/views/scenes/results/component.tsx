import React from 'react';
import { OLRefetcher } from 'views/components/refetcher';
import { OLResultsList } from 'views/components/result/list';
import { OLResultsTable } from 'views/components/result/table';
import { OlResult } from 'lib/graphql/generated/types';
import { OLLoading } from 'views/components/loading';

interface Props {
  refetch: () => Promise<void>;
  results: OlResult[];
  focus: boolean;
  competitionId: number;
  className: string;
  followedRunnerId?: string;
  isLandscape: boolean;
  loading?: boolean;
}

export const OLResults: React.FC<Props> = ({
  focus,
  refetch,
  className,
  competitionId,
  results,
  followedRunnerId,
  isLandscape,
  loading,
}) => {
  return (
    <>
      {focus && <OLRefetcher interval={15000} refetch={refetch} />}
      {isLandscape ? (
        <OLResultsTable
          results={results}
          competitionId={competitionId}
          className={className}
          disabled={!focus}
          followedRunnerId={followedRunnerId}
        />
      ) : (
        <OLResultsList
          results={results}
          competitionId={competitionId}
          className={className}
          disabled={!focus}
          followedRunnerId={followedRunnerId}
        />
      )}
      {loading && <OLLoading badge />}
    </>
  );
};
