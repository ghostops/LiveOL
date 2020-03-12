import * as React from 'react';
import { connect } from 'react-redux';
import { getCompetition } from 'store/stores/api';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { NavigationRoute } from 'react-navigation';
import { OLCompetition as Component } from './component';
import { Routes, RouterProps } from 'lib/nav/routes';
import { Lang } from 'lib/lang';

interface OwnProps extends RouterProps<{ id, title }> {}

interface StateProps {
    competition: Comp;
    classes: Classes[];
}

interface DispatchProps {
    getCompetition: (id: number) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    React.useEffect(
        () => {
            props.getCompetition(props.route.params.id);

            props.navigation.setOptions({
                title: props.route.params.title,
            });
        },
        [],
    );

    return (
        <Component
            competition={props.competition}
            classes={props.classes}

            goToLastPassings={() => {
                props.navigation.navigate(Routes.passings, {
                    id: props.route.params.id,
                    title: props.competition.name,
                });
            }}

            goToClass={(className: string) => () => {
                props.navigation.navigate(Routes.results, {
                    className,
                    id: props.route.params.id,
                });
            }}
        />
    );
};

const mapStateToProps = (state: AppState, props: Props): StateProps => ({
    competition: state.api.competitions.find((c) => c.id === props.route.params.id),
    classes: state.api.classes,
});

const mapDispatchToProps = {
    getCompetition,
};

export const OLCompetition = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
