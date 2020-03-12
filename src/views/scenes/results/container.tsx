import * as React from 'react';
import { connect } from 'react-redux';
import { OLResults as Component } from './component';
import { NavigationProp } from '@react-navigation/native';
import { getResults } from 'store/stores/api';
import { RouterProps } from 'lib/nav/routes';
import { Lang } from 'lib/lang';

interface OwnProps extends RouterProps<{ id, className }> {}

interface DispatchProps {
    getResults: (id: number, className: string) => Promise<void>;
}

interface StateProps {
    results: Result[];
    splits: SplitControl[];
}

type Props = OwnProps & DispatchProps & StateProps;

const DataWrapper: React.SFC<Props> = (props) => {
    const fetch = async () => props.getResults(
        props.route.params.id,
        props.route.params.className,
    );

    React.useEffect(
        () => {
            fetch();

            props.navigation.setOptions({
                title: `${Lang.print('classes.resultsFor')}: ${props.route.params.className}`,
            });
        },
        [],
    );

    return (
        <Component
            results={props.results}
            splits={props.splits}
            refetch={fetch}
        />
    );
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        results: (!!state.api.results && state.api.results.results),
        splits: (!!state.api.results && state.api.results.splitcontrols),
    };
};

const mapDispatchToProps = {
    getResults,
};

export const OLResults = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
