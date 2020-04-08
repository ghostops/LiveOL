import { gql } from 'apollo-boost';
import { CompetitionFragment, ClassFragment, EventorCompetitionFragment } from '../fragments/competition';

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
