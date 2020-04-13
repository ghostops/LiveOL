import * as React from 'react';
import _ from 'lodash';
import { ALL_COMPETITIONS } from 'lib/graphql/queries/competitions';
import { AllCompetitions } from 'lib/graphql/queries/types/AllCompetitions';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { connect } from 'react-redux';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLError } from 'views/components/error';
import { OLHome as Component } from './component';
import { Routes } from 'lib/nav/routes';
import { datesAreOnSameDay } from 'util/date';
import { useQuery } from '@apollo/react-hooks';
import * as Actions from './store';

interface OwnProps {
    navigation: NavigationProp<any, any>;
}

interface StateProps {
    searchResults: Competition[] | null;
    searching: boolean;
}

interface DispatchProps {
    setSearching: (value: boolean) => void;
    getCompetition: (id: number) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    const { data, loading, error } = useQuery<AllCompetitions>(ALL_COMPETITIONS);

    if (error) return <OLError error={error} />;

    const competitions: Competition[] = _.get(data, 'competitions.getAllCompetitions', null);

    return (
        <Component
            loading={loading}
            competitions={props.searchResults || competitions}
            openSearch={() => props.setSearching(true)}
            searching={props.searching}

            todaysCompetitions={(
                (competitions || [])
                    .filter((comp) => {
                        return datesAreOnSameDay(
                            new Date(comp.date),
                            new Date(),
                        );
                    })
            )}

            onCompetitionPress={(competition) => {
                props.navigation.navigate(Routes.competition, {
                    id: competition.id,
                    title: '',
                });
            }}
        />
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    searchResults: state.home.visibleCompetitions,
    searching: state.home.searching,
});

const mapDispatchToProps = {
    setSearching: Actions.setSearching,
};

export const OLHome = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
