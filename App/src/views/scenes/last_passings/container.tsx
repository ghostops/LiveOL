import * as React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { GET_LAST_PASSINGS } from 'lib/graphql/queries/passings';
import { GetLastPassingsVariables, GetLastPassings } from 'lib/graphql/queries/types/GetLastPassings';
import { OLError } from 'views/components/error';
import { OLPassings as Component } from './component';
import { Passing } from 'lib/graphql/fragments/types/Passing';
import { RouterProps } from 'lib/nav/routes';
import { useQuery } from '@apollo/react-hooks';

type OwnProps = RouterProps<{ id; title }>;

interface StateProps {
	landscape: boolean;
}

type Props = StateProps & OwnProps;

const DataWrapper: React.FC<Props> = (props) => {
	const competitionId: number = props.route.params.id;

	const { data, loading, error, refetch } = useQuery<GetLastPassings, GetLastPassingsVariables>(GET_LAST_PASSINGS, {
		variables: { competitionId },
	});

	if (error) {
		return <OLError error={error} refetch={refetch} />;
	}

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

const mapStateToProps = (state: AppState): StateProps => ({
	landscape: state.general.rotation === 'landscape',
});

export const OLPassings = connect(mapStateToProps, null)(DataWrapper);
