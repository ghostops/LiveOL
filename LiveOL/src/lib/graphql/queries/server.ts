import { gql } from '@apollo/client';

export const GET_SERVER_VERSION = gql`
  query ServerVersion {
    server {
      version
    }
  }
`;
