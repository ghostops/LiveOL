import { gql } from '@apollo/client';
import { ClubFragment } from '../fragments/club';

export const GET_CLUB_BY_NAME = gql`
  query GetClubByName($name: String!) {
    clubs {
      getClubByName(clubName: $name) {
        ...Club
      }
    }
  }

  ${ClubFragment}
`;
