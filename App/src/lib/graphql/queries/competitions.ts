import { gql } from 'apollo-boost';
import { CompetitionFragment, ClassFragment, EventorCompetitionFragment } from '../fragments/competition';

export const COMPETITIONS = gql`
	query Competitions($page: Int, $search: String, $date: String) {
		competitions {
			getCompetitions(page: $page, search: $search, date: $date) {
				page
				lastPage
				search
				today {
					...Competition
				}
				competitions {
					...Competition
				}
			}
		}
	}

	${CompetitionFragment}
`;

export const ALL_COMPETITIONS = gql`
	query AllCompetitions {
		competitions {
			getAllCompetitions {
				...Competition
			}
		}
	}

	${CompetitionFragment}
`;

export const GET_COMPETITION = gql`
	query GetCompetition($competitionId: Int!) {
		competitions {
			getCompetition(competitionId: $competitionId) {
				...Competition
				...EventorCompetitionFragment
			}
			getCompetitionClasses(competitionId: $competitionId) {
				...Class
			}
		}
	}

	${CompetitionFragment}
	${EventorCompetitionFragment}
	${ClassFragment}
`;
