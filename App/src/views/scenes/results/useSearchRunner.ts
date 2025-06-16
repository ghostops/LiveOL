import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { paths } from '~/lib/react-query/schema';
import { useResultSearchStore } from '~/store/resultSearch';

export const useSearchRunner = (
  results?: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'],
) => {
  const { t } = useTranslation();

  const setSearchTerm = useResultSearchStore(state => state.setSearchTerm);
  const searchTerm = useResultSearchStore(state => state.searchTerm);

  const foundRunner = useMemo(() => {
    if (!searchTerm || !results) {
      return undefined;
    }

    return (
      results.find(
        runner =>
          searchTerm &&
          runner.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || 'not-found'
    );
  }, [results, searchTerm]);

  useEffect(() => {
    if (foundRunner === 'not-found') {
      Alert.alert(t('result.notFound'));
      setSearchTerm(undefined);
    }
  }, [foundRunner, t, setSearchTerm]);

  useEffect(() => {
    return () => setSearchTerm(undefined);
  }, [setSearchTerm]);

  return typeof foundRunner === 'object' ? foundRunner : undefined;
};
