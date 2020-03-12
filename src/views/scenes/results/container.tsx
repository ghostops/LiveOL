import * as React from 'react';
import { connect } from 'react-redux';
import { OLResults as Component } from './component';
import { NavigationProp } from '@react-navigation/native';
import { getResults } from 'store/stores/api';
import { RouterProps } from 'lib/nav/routes';
import { Lang } from 'lib/lang';
import { showToast } from 'lib/toasts/rotate';

interface OwnProps extends RouterProps<{ id, className }> {}

interface DispatchProps {
    getResults: (id: number, className: string) => Promise<void>;
}

interface StateProps {
    olClass: OLClass;
}

type Props = OwnProps & DispatchProps & StateProps;

const DataWrapper: React.SFC<Props> = ({ olClass, getResults, route, navigation }) => {
    const fetch = async () => getResults(
        route.params.id,
        route.params.className,
    );

    React.useEffect(
        () => {
            fetch();

            navigation.setOptions({
                title: `${Lang.print('classes.resultsFor')}: ${route.params.className}`,
            });

            showToast();
        },
        [],
    );

    return (
        <Component
            results={olClass.results}
            splits={olClass.splitcontrols}
            refetch={fetch}
        />
    );
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        olClass: (!!state.api.results && state.api.results),
    };
};

const mapDispatchToProps = {
    getResults,
};

export const OLResults = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
