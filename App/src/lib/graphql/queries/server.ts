import { gql } from 'apollo-boost';

export const GET_SERVER_VERSION = gql`
    query ServerVersion{
        server {
            version
        }
    }
`;
