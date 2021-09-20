import { gql } from 'apollo-boost';
import { ResultFragment, SplitControlFragment } from '../fragments/results';

export const GET_RESULTS = gql`
	query GetResults($competitionId: Int!, $className: String!) {
		results {
			getResults(competitionId: $competitionId, className: $className) {
				...Result
			}
		}
	}

	${ResultFragment}
`;

export const GET_SPLIT_CONTROLS = gql`
	query GetSplitControls($competitionId: Int!, $className: String!) {
		results {
			getSplitControls(competitionId: $competitionId, className: $className) {
				...SplitControl
			}
		}
	}

	${SplitControlFragment}
`;

export const GET_CLUB_RESULTS = gql`
	query GetClubResults($competitionId: Int!, $clubName: String!) {
		results {
			getClubResults(competitionId: $competitionId, clubName: $clubName) {
				...Result
			}
		}
	}

	${ResultFragment}
`;
