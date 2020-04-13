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
    setSearchTerm: (term: string) => void;
    setSearching: (value: boolean) => void;
}

type Props = StateProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    return (
        <Component
            searching={props.searching}
            setSearching={props.setSearching}
            setSearchTerm={props.setSearchTerm}
        />
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    searching: state.home.searching,
});

const mapDispatchToProps = {
    setSearchTerm: Actions.setSearchTerm,
    setSearching: Actions.setSearching,
};

export const OLSearch = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
