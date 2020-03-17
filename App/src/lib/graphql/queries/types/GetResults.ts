/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetResults
// ====================================================

export interface GetResults_results_getResults_splits {
  __typename: "OLSplit";
  id: string | null;
  name: string | null;
  time: string | null;
  status: number | null;
  place: number | null;
  timeplus: string | null;
}

export interface GetResults_results_getResults {
  __typename: "OLResult";
  id: string | null;
  hasSplits: boolean | null;
  start: string | null;
  place: string | null;
  name: string | null;
  club: string | null;
  result: string | null;
  status: number | null;
  timeplus: string | null;
  splits: (GetResults_results_getResults_splits | null)[] | null;
}

export interface GetResults_results {
  __typename: "ResultsQuery";
  getResults: (GetResults_results_getResults | null)[] | null;
}

export interface GetResults {
  results: GetResults_results | null;
}

export interface GetResultsVariables {
  competitionId: number;
  className: string;
}
