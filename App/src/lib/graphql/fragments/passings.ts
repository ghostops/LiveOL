import { gql } from 'apollo-boost';

export const PassingFragment = gql`
    fragment Passing on OLPassing {
        id
        class
        control
        controlName
        passtime
        runnerName
        time
    }
`;
