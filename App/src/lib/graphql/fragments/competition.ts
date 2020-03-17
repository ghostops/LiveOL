import { gql } from 'apollo-boost';

export const CompetitionFragment = gql`
    fragment Competition on OLCompetition {
        id
        name
        organizer
        date
    }
`;
