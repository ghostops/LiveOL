import { gql } from '@apollo/client';

export const ClubFragment = gql`
  fragment Club on OLClub {
    id
    name
    country
    address
    website
    email
    clubLogoUrl
    clubLogoSizes
  }
`;
