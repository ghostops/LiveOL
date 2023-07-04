import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { useSearchStore } from 'store/search';
import { useOLNavigation } from 'hooks/useNavigation';
import { useDeviceRotationStore } from 'store/deviceRotation';
import { useGetCompetitionsQuery } from 'lib/graphql/generated/gql';
import { Platform } from 'react-native';
import { OLHome as Component } from './component';
import { OLError } from 'views/components/error';
import { OlCompetition } from 'lib/graphql/generated/types';
import RNBootSplash from 'react-native-bootsplash';
import { usePlusCodes } from 'hooks/usePlusCodes';

const getToday = () => moment().format('YYYY-MM-DD');

export const OLHome: React.FC = () => {
  const { isLandscape } = useDeviceRotationStore();
  const { isSearching, searchTerm, setIsSearching } = useSearchStore();
  const { navigate } = useOLNavigation();

  // Load in code data
  usePlusCodes();

  const { data, loading, error, fetchMore, refetch } = useGetCompetitionsQuery({
    variables: { search: searchTerm || null, date: getToday() },
    onCompleted: () => {
      RNBootSplash.hide({ fade: true });
    },
    onError: () => {
      RNBootSplash.hide({ fade: true });
    },
  });

  if (error) {
    return (
      <OLError error={error} refetch={() => refetch({ date: getToday() })} />
    );
  }

  const competitions =
    (data?.competitions?.getCompetitions?.competitions as OlCompetition[]) ||
    [];
  const today =
    (data?.competitions?.getCompetitions?.today as OlCompetition[]) || [];

  const loadMore = async () => {
    if (loading) {
      return;
    }

    const page = (data.competitions.getCompetitions.page || 0) + 1;
    const lastPage = data.competitions.getCompetitions.lastPage || 0;

    if (page >= lastPage) {
      return;
    }

    await fetchMore({
      variables: {
        page,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const comps = _.uniqBy(
          [
            ...(prev?.competitions.getCompetitions?.competitions || []),
            ...(fetchMoreResult?.competitions.getCompetitions?.competitions ||
              []),
          ],
          'id',
        );

        return Object.assign({}, prev, {
          ...fetchMoreResult,
          competitions: {
            ...fetchMoreResult?.competitions,
            getCompetitions: {
              ...fetchMoreResult?.competitions?.getCompetitions,
              competitions: comps,
            },
          },
        });
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
          competitionId: competition.id || -1,
          title: Platform.OS === 'android' ? competition.name || '' : '',
        });
      }}
      landscape={isLandscape}
    />
  );
};
