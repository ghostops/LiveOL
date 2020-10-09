import { gql } from 'apollo-boost';

export const SplitControlFragment = gql`
	fragment SplitControl on OLSplitControl {
		id
		name
		code
	}
`;

export const SplitFragment = gql`
	fragment Split on OLSplit {
		id
		name
		time
		status
		place
		timeplus
	}
`;

export const ResultFragment = gql`
	fragment Result on OLResult {
		id
		hasSplits
		start
		place
		name
		club
		result
		status
		timeplus
		progress

		liveRunningStart

		splits {
			...Split
		}
	}

	${SplitFragment}
`;
