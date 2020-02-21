import * as React from 'react';
import { connect } from 'react-redux';
import { getLastPassings } from 'store/stores/api';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { NavigationRoute } from 'react-navigation';
import { OLPassings as Component } from './component';
import { Routes, RouterProps } from 'lib/nav/routes';
import Lang from 'lib/lang';

interface OwnProps extends RouterProps<{ id, title }> {}

interface StateProps {
    passings: Passing[];
}

interface DispatchProps {
    getLastPassings: (id: number) => Promise<void>;
}

type Props = StateProps & OwnProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    React.useEffect(
        () => {
            props.navigation.setOptions({
                title: props.route.params.title,
            });
        },
        [],
    );

    const refresh = () => props.getLastPassings(props.route.params.id);

    return (
        <Component
            passings={props.passings}
            refresh={refresh}
        />
    );
};

const mapStateToProps = (state: AppState, props: Props): StateProps => ({
    // competition: state.api.competitions.find((c) => c.id === props.route.params.id),
    // classes: state.api.classes,
    passings: state.api.lastPassings,
});

const mapDispatchToProps = {
    getLastPassings,
};

export const OLPassings = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
