import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const ClubFragmentDoc = gql`
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
export const CompetitionFragmentDoc = gql`
  fragment Competition on OLCompetition {
    id
    name
    organizer
    date
    eventor
  }
`;
export const EventorCompetitionFragmentFragmentDoc = gql`
  fragment EventorCompetitionFragment on OLCompetition {
    info
    club
    clubLogoUrl
    clubLogoSizes
    canceled
    distance
    district
    signups
    eventorUrl
  }
`;
export const ClassFragmentDoc = gql`
  fragment Class on OLClass {
    id
    competition
    name
  }
`;
export const PassingFragmentDoc = gql`
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
export const SplitControlFragmentDoc = gql`
  fragment SplitControl on OLSplitControl {
    id
    name
    code
  }
`;
export const SplitFragmentDoc = gql`
  fragment Split on OLSplit {
    id
    name
    time
    status
    place
    timeplus
  }
`;
export const ResultFragmentDoc = gql`
  fragment Result on OLResult {
    id
    hasSplits
    start
    place
    name
    club
    class
    result
    status
    timeplus
    progress
    liveRunningStart
    splits {
      ...Split
    }
  }
  ${SplitFragmentDoc}
`;
export const RedeemPlusCodeDocument = gql`
  mutation RedeemPlusCode($code: String!, $deviceId: String!) {
    server {
      redeemPlusCode(code: $code, deviceId: $deviceId)
    }
  }
`;
export type RedeemPlusCodeMutationFn = Apollo.MutationFunction<
  Types.RedeemPlusCodeMutation,
  Types.RedeemPlusCodeMutationVariables
>;

/**
 * __useRedeemPlusCodeMutation__
 *
 * To run a mutation, you first call `useRedeemPlusCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRedeemPlusCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [redeemPlusCodeMutation, { data, loading, error }] = useRedeemPlusCodeMutation({
 *   variables: {
 *      code: // value for 'code'
 *      deviceId: // value for 'deviceId'
 *   },
 * });
 */
export function useRedeemPlusCodeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    Types.RedeemPlusCodeMutation,
    Types.RedeemPlusCodeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    Types.RedeemPlusCodeMutation,
    Types.RedeemPlusCodeMutationVariables
  >(RedeemPlusCodeDocument, options);
}
export type RedeemPlusCodeMutationHookResult = ReturnType<
  typeof useRedeemPlusCodeMutation
>;
export type RedeemPlusCodeMutationResult =
  Apollo.MutationResult<Types.RedeemPlusCodeMutation>;
export type RedeemPlusCodeMutationOptions = Apollo.BaseMutationOptions<
  Types.RedeemPlusCodeMutation,
  Types.RedeemPlusCodeMutationVariables
>;
export const GetClubByNameDocument = gql`
  query GetClubByName($name: String!) {
    clubs {
      getClubByName(clubName: $name) {
        ...Club
      }
    }
  }
  ${ClubFragmentDoc}
`;

/**
 * __useGetClubByNameQuery__
 *
 * To run a query within a React component, call `useGetClubByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClubByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClubByNameQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetClubByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.GetClubByNameQuery,
    Types.GetClubByNameQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetClubByNameQuery,
    Types.GetClubByNameQueryVariables
  >(GetClubByNameDocument, options);
}
export function useGetClubByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetClubByNameQuery,
    Types.GetClubByNameQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetClubByNameQuery,
    Types.GetClubByNameQueryVariables
  >(GetClubByNameDocument, options);
}
export type GetClubByNameQueryHookResult = ReturnType<
  typeof useGetClubByNameQuery
>;
export type GetClubByNameLazyQueryHookResult = ReturnType<
  typeof useGetClubByNameLazyQuery
>;
export type GetClubByNameQueryResult = Apollo.QueryResult<
  Types.GetClubByNameQuery,
  Types.GetClubByNameQueryVariables
>;
export const GetCompetitionsDocument = gql`
  query GetCompetitions($page: Int, $search: String, $date: String) {
    competitions {
      getCompetitions(page: $page, search: $search, date: $date) {
        page
        lastPage
        search
        today {
          ...Competition
        }
        competitions {
          ...Competition
        }
      }
    }
  }
  ${CompetitionFragmentDoc}
`;

/**
 * __useGetCompetitionsQuery__
 *
 * To run a query within a React component, call `useGetCompetitionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      search: // value for 'search'
 *      date: // value for 'date'
 *   },
 * });
 */
export function useGetCompetitionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    Types.GetCompetitionsQuery,
    Types.GetCompetitionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetCompetitionsQuery,
    Types.GetCompetitionsQueryVariables
  >(GetCompetitionsDocument, options);
}
export function useGetCompetitionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetCompetitionsQuery,
    Types.GetCompetitionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetCompetitionsQuery,
    Types.GetCompetitionsQueryVariables
  >(GetCompetitionsDocument, options);
}
export type GetCompetitionsQueryHookResult = ReturnType<
  typeof useGetCompetitionsQuery
>;
export type GetCompetitionsLazyQueryHookResult = ReturnType<
  typeof useGetCompetitionsLazyQuery
>;
export type GetCompetitionsQueryResult = Apollo.QueryResult<
  Types.GetCompetitionsQuery,
  Types.GetCompetitionsQueryVariables
>;
export const GetCompetitionDocument = gql`
  query GetCompetition($competitionId: Int!) {
    competitions {
      getCompetition(competitionId: $competitionId) {
        ...Competition
        ...EventorCompetitionFragment
      }
      getCompetitionClasses(competitionId: $competitionId) {
        ...Class
      }
    }
  }
  ${CompetitionFragmentDoc}
  ${EventorCompetitionFragmentFragmentDoc}
  ${ClassFragmentDoc}
`;

/**
 * __useGetCompetitionQuery__
 *
 * To run a query within a React component, call `useGetCompetitionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetCompetitionQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.GetCompetitionQuery,
    Types.GetCompetitionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetCompetitionQuery,
    Types.GetCompetitionQueryVariables
  >(GetCompetitionDocument, options);
}
export function useGetCompetitionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetCompetitionQuery,
    Types.GetCompetitionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetCompetitionQuery,
    Types.GetCompetitionQueryVariables
  >(GetCompetitionDocument, options);
}
export type GetCompetitionQueryHookResult = ReturnType<
  typeof useGetCompetitionQuery
>;
export type GetCompetitionLazyQueryHookResult = ReturnType<
  typeof useGetCompetitionLazyQuery
>;
export type GetCompetitionQueryResult = Apollo.QueryResult<
  Types.GetCompetitionQuery,
  Types.GetCompetitionQueryVariables
>;
export const GetLastPassingsDocument = gql`
  query GetLastPassings($competitionId: Int!) {
    lastPassings {
      getLastPassings(competitionId: $competitionId) {
        ...Passing
      }
    }
  }
  ${PassingFragmentDoc}
`;

/**
 * __useGetLastPassingsQuery__
 *
 * To run a query within a React component, call `useGetLastPassingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastPassingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastPassingsQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetLastPassingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.GetLastPassingsQuery,
    Types.GetLastPassingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetLastPassingsQuery,
    Types.GetLastPassingsQueryVariables
  >(GetLastPassingsDocument, options);
}
export function useGetLastPassingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetLastPassingsQuery,
    Types.GetLastPassingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetLastPassingsQuery,
    Types.GetLastPassingsQueryVariables
  >(GetLastPassingsDocument, options);
}
export type GetLastPassingsQueryHookResult = ReturnType<
  typeof useGetLastPassingsQuery
>;
export type GetLastPassingsLazyQueryHookResult = ReturnType<
  typeof useGetLastPassingsLazyQuery
>;
export type GetLastPassingsQueryResult = Apollo.QueryResult<
  Types.GetLastPassingsQuery,
  Types.GetLastPassingsQueryVariables
>;
export const ValidatePlusCodeDocument = gql`
  query ValidatePlusCode($code: String!, $deviceId: String!) {
    server {
      validatePlusCode(code: $code, deviceId: $deviceId)
    }
  }
`;

/**
 * __useValidatePlusCodeQuery__
 *
 * To run a query within a React component, call `useValidatePlusCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidatePlusCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidatePlusCodeQuery({
 *   variables: {
 *      code: // value for 'code'
 *      deviceId: // value for 'deviceId'
 *   },
 * });
 */
export function useValidatePlusCodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.ValidatePlusCodeQuery,
    Types.ValidatePlusCodeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.ValidatePlusCodeQuery,
    Types.ValidatePlusCodeQueryVariables
  >(ValidatePlusCodeDocument, options);
}
export function useValidatePlusCodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.ValidatePlusCodeQuery,
    Types.ValidatePlusCodeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.ValidatePlusCodeQuery,
    Types.ValidatePlusCodeQueryVariables
  >(ValidatePlusCodeDocument, options);
}
export type ValidatePlusCodeQueryHookResult = ReturnType<
  typeof useValidatePlusCodeQuery
>;
export type ValidatePlusCodeLazyQueryHookResult = ReturnType<
  typeof useValidatePlusCodeLazyQuery
>;
export type ValidatePlusCodeQueryResult = Apollo.QueryResult<
  Types.ValidatePlusCodeQuery,
  Types.ValidatePlusCodeQueryVariables
>;
export const GetResultsDocument = gql`
  query GetResults(
    $competitionId: Int!
    $className: String!
    $sorting: String
  ) {
    results {
      getResults(
        competitionId: $competitionId
        className: $className
        sorting: $sorting
      ) {
        ...Result
      }
    }
  }
  ${ResultFragmentDoc}
`;

/**
 * __useGetResultsQuery__
 *
 * To run a query within a React component, call `useGetResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResultsQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      className: // value for 'className'
 *      sorting: // value for 'sorting'
 *   },
 * });
 */
export function useGetResultsQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.GetResultsQuery,
    Types.GetResultsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<Types.GetResultsQuery, Types.GetResultsQueryVariables>(
    GetResultsDocument,
    options,
  );
}
export function useGetResultsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetResultsQuery,
    Types.GetResultsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetResultsQuery,
    Types.GetResultsQueryVariables
  >(GetResultsDocument, options);
}
export type GetResultsQueryHookResult = ReturnType<typeof useGetResultsQuery>;
export type GetResultsLazyQueryHookResult = ReturnType<
  typeof useGetResultsLazyQuery
>;
export type GetResultsQueryResult = Apollo.QueryResult<
  Types.GetResultsQuery,
  Types.GetResultsQueryVariables
>;
export const GetSplitControlsDocument = gql`
  query GetSplitControls($competitionId: Int!, $className: String!) {
    results {
      getSplitControls(competitionId: $competitionId, className: $className) {
        ...SplitControl
      }
    }
  }
  ${SplitControlFragmentDoc}
`;

/**
 * __useGetSplitControlsQuery__
 *
 * To run a query within a React component, call `useGetSplitControlsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSplitControlsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSplitControlsQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      className: // value for 'className'
 *   },
 * });
 */
export function useGetSplitControlsQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.GetSplitControlsQuery,
    Types.GetSplitControlsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetSplitControlsQuery,
    Types.GetSplitControlsQueryVariables
  >(GetSplitControlsDocument, options);
}
export function useGetSplitControlsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetSplitControlsQuery,
    Types.GetSplitControlsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetSplitControlsQuery,
    Types.GetSplitControlsQueryVariables
  >(GetSplitControlsDocument, options);
}
export type GetSplitControlsQueryHookResult = ReturnType<
  typeof useGetSplitControlsQuery
>;
export type GetSplitControlsLazyQueryHookResult = ReturnType<
  typeof useGetSplitControlsLazyQuery
>;
export type GetSplitControlsQueryResult = Apollo.QueryResult<
  Types.GetSplitControlsQuery,
  Types.GetSplitControlsQueryVariables
>;
export const GetClubResultsDocument = gql`
  query GetClubResults($competitionId: Int!, $clubName: String!) {
    results {
      getClubResults(competitionId: $competitionId, clubName: $clubName) {
        ...Result
      }
    }
  }
  ${ResultFragmentDoc}
`;

/**
 * __useGetClubResultsQuery__
 *
 * To run a query within a React component, call `useGetClubResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClubResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClubResultsQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      clubName: // value for 'clubName'
 *   },
 * });
 */
export function useGetClubResultsQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.GetClubResultsQuery,
    Types.GetClubResultsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetClubResultsQuery,
    Types.GetClubResultsQueryVariables
  >(GetClubResultsDocument, options);
}
export function useGetClubResultsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetClubResultsQuery,
    Types.GetClubResultsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetClubResultsQuery,
    Types.GetClubResultsQueryVariables
  >(GetClubResultsDocument, options);
}
export type GetClubResultsQueryHookResult = ReturnType<
  typeof useGetClubResultsQuery
>;
export type GetClubResultsLazyQueryHookResult = ReturnType<
  typeof useGetClubResultsLazyQuery
>;
export type GetClubResultsQueryResult = Apollo.QueryResult<
  Types.GetClubResultsQuery,
  Types.GetClubResultsQueryVariables
>;
export const GetServerVersionDocument = gql`
  query GetServerVersion {
    server {
      version
    }
  }
`;

/**
 * __useGetServerVersionQuery__
 *
 * To run a query within a React component, call `useGetServerVersionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetServerVersionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetServerVersionQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetServerVersionQuery(
  baseOptions?: Apollo.QueryHookOptions<
    Types.GetServerVersionQuery,
    Types.GetServerVersionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.GetServerVersionQuery,
    Types.GetServerVersionQueryVariables
  >(GetServerVersionDocument, options);
}
export function useGetServerVersionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.GetServerVersionQuery,
    Types.GetServerVersionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.GetServerVersionQuery,
    Types.GetServerVersionQueryVariables
  >(GetServerVersionDocument, options);
}
export type GetServerVersionQueryHookResult = ReturnType<
  typeof useGetServerVersionQuery
>;
export type GetServerVersionLazyQueryHookResult = ReturnType<
  typeof useGetServerVersionLazyQuery
>;
export type GetServerVersionQueryResult = Apollo.QueryResult<
  Types.GetServerVersionQuery,
  Types.GetServerVersionQueryVariables
>;
