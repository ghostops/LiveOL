import { gql } from '@apollo/client';

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
