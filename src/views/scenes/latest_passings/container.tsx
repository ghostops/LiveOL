import * as React from 'react';
import { connect } from 'react-redux';
import { getLastPassings } from 'store/stores/api';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { NavigationRoute } from 'react-navigation';
import { OLPassings as Component } from './component';
import { Routes, RouterProps } from 'lib/nav/routes';
import { Lang } from 'lib/lang';
import { ScreenOrientation } from 'expo';

interface OwnProps extends RouterProps<{ id, title }> {}

interface StateProps {
    passings: Passing[];
    landscape: boolean;
}

interface DispatchProps {
    getLastPassings: (id: number) => Promise<void>;
}

type Props = StateProps & OwnProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    React.useEffect(
        () => {
            props.getLastPassings(props.route.params.id);

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
            landscape={props.landscape}
        />
    );
};

const mapStateToProps = (state: AppState, props: Props): StateProps => ({
    passings: state.api.lastPassings,
    landscape: state.general.rotation === ScreenOrientation.Orientation.LANDSCAPE,
});

const mapDispatchToProps = {
    getLastPassings,
};

export const OLPassings = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
