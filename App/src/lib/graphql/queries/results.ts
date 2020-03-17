import { gql } from 'apollo-boost';
import { ResultFragment } from '../fragments/results';

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
