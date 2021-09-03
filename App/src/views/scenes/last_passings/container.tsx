import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/react-hooks';
import { RouterProps } from 'lib/nav/routes';
import { Passing } from 'lib/graphql/fragments/types/Passing';
import { OLPassings as Component } from './component';
import { OLError } from 'views/components/error';
import { isLandscapeSelector } from 'store/isLandscapeSelector';
import { GetLastPassingsVariables, GetLastPassings } from 'lib/graphql/queries/types/GetLastPassings';
import { GET_LAST_PASSINGS } from 'lib/graphql/queries/passings';
import _ from 'lodash';

type OwnProps = RouterProps<{ id; title }>;

type Props = OwnProps;

export const OLPassings: React.FC<Props> = (props) => {
	const isLandscape = useRecoilValue(isLandscapeSelector);

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
			landscape={isLandscape}
		/>
	);
};
