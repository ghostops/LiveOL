import { gql } from 'apollo-boost';
import { CompetitionFragment } from '../fragments/competition';

export default gql`
    query AllCompetitions {
        competitions {
            getAllCompetitions {
                ...Competition
            }
        }
    }

    ${CompetitionFragment}
`;
