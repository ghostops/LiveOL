import { gql } from 'apollo-boost';
import { CompetitionFragment } from '../fragments/competition';

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
