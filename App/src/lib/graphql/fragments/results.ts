import { gql } from 'apollo-boost';

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

        splits {
            ...Split
        }
    }

    ${SplitFragment}
`;
