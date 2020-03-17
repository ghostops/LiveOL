import { gql } from 'apollo-boost';
import { CompetitionFragment, ClassFragment } from '../fragments/competition';

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
            }
            getCompetitionClasses(competitionId: $competitionId) {
                ...Class
            }
        }
    }

    ${CompetitionFragment}
    ${ClassFragment}
`;
