import { gql } from '@apollo/client';
import { PassingFragment } from '../fragments/passings';

export const GET_LAST_PASSINGS = gql`
  query GetLastPassings($competitionId: Int!) {
    lastPassings {
      getLastPassings(competitionId: $competitionId) {
        ...Passing
      }
    }
  }

  ${PassingFragment}
`;
