import * as React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { GET_LAST_PASSINGS } from 'lib/graphql/queries/passings';
import { getLastPassings } from 'store/stores/api';
import { GetLastPassingsVariables, GetLastPassings } from 'lib/graphql/queries/types/GetLastPassings';
import { Lang } from 'lib/lang';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { NavigationRoute } from 'react-navigation';
import { OLError } from 'views/components/error';
import { OLPassings as Component } from './component';
import { Passing } from 'lib/graphql/fragments/types/Passing';
import { Routes, RouterProps } from 'lib/nav/routes';
import { ScreenOrientation } from 'expo';
import { useQuery } from '@apollo/react-hooks';

interface OwnProps extends RouterProps<{ id, title }> {}

interface StateProps {
    landscape: boolean;
}

type Props = StateProps & OwnProps;

const DataWrapper: React.SFC<Props> = (props) => {
    const competitionId: number = props.route.params.id;

    React.useEffect(
        () => {
            props.navigation.setOptions({
                title: props.route.params.title,
            });
        },
        [],
    );

    const { data, loading, error, refetch } =
        useQuery<GetLastPassings, GetLastPassingsVariables>(
            GET_LAST_PASSINGS,
            { variables: { competitionId } },
        );

    if (error) return <OLError error={error} />;

    const passings: Passing[] = _.get(data, 'lastPassings.getLastPassings', null);

    return (
        <Component
            loading={loading}
            passings={passings}
            refresh={() => void refetch({ competitionId })}
            landscape={props.landscape}
        />
    );
};

const mapStateToProps = (state: AppState, props: Props): StateProps => ({
    landscape: state.general.rotation === ScreenOrientation.Orientation.LANDSCAPE,
});

export const OLPassings = connect(mapStateToProps, null)(DataWrapper);
