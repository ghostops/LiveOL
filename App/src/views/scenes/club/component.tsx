import { OLRefetcherBar } from '~/views/components/refetcher/bar';
import { OLResultsList } from '~/views/components/result/list';
import { OLResultsTable } from '~/views/components/result/table';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { TRPCQueryOutput } from '~/lib/trpc/client';

interface Props {
  refetch: () => Promise<void>;
  results: TRPCQueryOutput['getClubResults'];
  competitionId: number;
  clubName: string;
  loading: boolean;
}

export const OLClubResults: React.FC<Props> = ({
  clubName,
  competitionId,
  refetch,
  results,
  loading,
}) => {
  const { isLandscape } = useDeviceRotationStore();

  return (
    <>
      <OLRefetcherBar interval={15000} refetch={refetch} />

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
          loading={loading}
        />
      )}
    </>
  );
};
