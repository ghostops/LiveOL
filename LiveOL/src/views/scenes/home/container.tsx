import * as React from 'react';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { Platform } from 'react-native';
import { OLHome as Component } from './component';
import { OLError } from 'views/components/error';
import { useDeviceRotationStore } from 'store/deviceRotation';
import {
  Competitions,
  CompetitionsVariables,
} from 'lib/graphql/queries/types/Competitions';
import { COMPETITIONS } from 'lib/graphql/queries/competitions';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import _ from 'lodash';
import { useSearchStore } from 'store/search';
import { useOLNavigation } from 'hooks/useNavigation';

const getToday = () => moment().format('YYYY-MM-DD');

export const OLHome: React.FC = () => {
  const { isLandscape } = useDeviceRotationStore();
  const { isSearching, searchTerm, setIsSearching } = useSearchStore();
  const { navigate } = useOLNavigation();

  const { data, loading, error, fetchMore, refetch } = useQuery<
    Competitions,
    CompetitionsVariables
  >(COMPETITIONS, {
    variables: {
      search: searchTerm || null,
      date: getToday(),
    },
  });

  if (error) {
    return (
      <OLError error={error} refetch={() => refetch({ date: getToday() })} />
    );
  }

  const competitions: Competition[] = _.get(
    data,
    'competitions.getCompetitions.competitions',
    [],
  );

  const today: Competition[] = _.get(
    data,
    'competitions.getCompetitions.today',
    [],
  );

  const loadMore = async () => {
    if (loading) {
      return;
    }

    const page = (data?.competitions?.getCompetitions?.page || 0) + 1;
    const lastPage = data?.competitions?.getCompetitions?.lastPage || 0;

    if (page >= lastPage) {
      return;
    }

    await fetchMore({
      variables: {
        page,
      },
      updateQuery: (prev: Competitions, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const comps = _.uniqBy(
          [
            ...(prev?.competitions?.getCompetitions?.competitions || []),
            ...(fetchMoreResult?.competitions?.getCompetitions?.competitions ||
              []),
          ],
          'id',
        );

        return Object.assign({}, prev, {
          ...fetchMoreResult.competitions,
          competitions: {
            ...fetchMoreResult.competitions,
            getCompetitions: {
              ...fetchMoreResult?.competitions?.getCompetitions,
              competitions: comps,
            },
          },
        } as Competitions);
      },
    });
  };

  return (
    <Component
      competitions={competitions}
      loading={loading}
      loadMore={loadMore}
      openSearch={() => setIsSearching(true)}
      searching={isSearching}
      todaysCompetitions={today}
      refetch={async () => {
        await refetch({ date: getToday() });
      }}
      onCompetitionPress={competition => {
        navigate('Competition', {
          id: competition.id || -1,
          title: Platform.OS === 'android' ? competition.name || '' : '',
        });
      }}
      landscape={isLandscape}
    />
  );
};
