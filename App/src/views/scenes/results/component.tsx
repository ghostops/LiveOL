import { OLRefetcher } from '~/views/components/refetcher';
import { OLResultsList } from '~/views/components/result/list';
import { OLResultsTable } from '~/views/components/result/table';
import { OLLoading } from '~/views/components/loading';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { View } from 'react-native';
import { OLHint } from '~/views/components/hint';
import { useTranslation } from 'react-i18next';
import { usePromoStore } from '~/store/promo';

interface Props {
  refetch: () => Promise<void>;
  results: TRPCQueryOutput['getResults'];
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
  const { t } = useTranslation();
  const { displayRotatePromo, setDisplayRotatePromo } = usePromoStore();

  return (
    <View style={{ flex: 1 }}>
      {focus && <OLRefetcher interval={15000} refetch={refetch} />}
      {displayRotatePromo && (
        <OLHint onPress={() => setDisplayRotatePromo(false)}>
          {t('promotions.rotate')}
        </OLHint>
      )}
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
          loading={!!loading}
        />
      )}
      {loading && <OLLoading badge />}
    </View>
  );
};
