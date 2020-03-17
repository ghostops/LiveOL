import { gql } from 'apollo-boost';

export const CompetitionFragment = gql`
    fragment Competition on OLCompetition {
        id
        name
        organizer
        date
    }
`;

export const ClassFragment = gql`
    fragment Class on OLClass {
        id
        competition
        name
    }
`;
