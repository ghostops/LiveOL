import { OLRefetcherBar } from '~/views/components/refetcher/bar';
import { OLResultsList } from '~/views/components/result/list';
import { OLResultsTable } from '~/views/components/result/table';
import { OLLoading } from '~/views/components/loading';
import { View } from 'react-native';
import { OLHint } from '~/views/components/hint';
import { useTranslation } from 'react-i18next';
import { usePromoStore } from '~/store/promo';
import { paths } from '~/lib/react-query/schema';

interface Props {
  refetch: () => Promise<void>;
  results: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'];
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
      {focus && <OLRefetcherBar interval={15000} refetch={refetch} />}
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
