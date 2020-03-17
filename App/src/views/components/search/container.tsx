import * as React from 'react';
import * as Actions from 'views/scenes/home/store';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { OLSearch as Component } from './component';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { AllCompetitions } from 'lib/graphql/queries/types/AllCompetitions';
import { ALL_COMPETITIONS } from 'lib/graphql/queries/competitions';

interface StateProps {
    searching: boolean;
}

interface DispatchProps {
    setVisibleCompetitions: (competitions: Competition[]) => void;
    setSearching: (value: boolean) => void;
}

type Props = StateProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    const { data, loading, error } = useQuery<AllCompetitions>(ALL_COMPETITIONS);

    if (loading || error) return null;

    return (
        <Component
            competitions={data.competitions.getAllCompetitions}
            searching={props.searching}
            setSearching={props.setSearching}
            setVisibleCompetitions={props.setVisibleCompetitions}
        />
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    searching: state.home.searching,
});

const mapDispatchToProps = {
    setVisibleCompetitions: Actions.setVisibleCompetitions,
    setSearching: Actions.setSearching,
};

export const OLSearch = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
