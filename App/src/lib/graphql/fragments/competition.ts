import { gql } from 'apollo-boost';

export const CompetitionFragment = gql`
    fragment Competition on OLCompetition {
        id
        name
        organizer
        date
        eventor
    }
`;

export const EventorCompetitionFragment = gql`
    fragment EventorCompetitionFragment on OLCompetition {
        info
        club
        clubLogoUrl
        clubLogoSizes
        canceled
        distance
        district
        signups
    }
`;

export const ClassFragment = gql`
    fragment Class on OLClass {
        id
        competition
        name
    }
`;
