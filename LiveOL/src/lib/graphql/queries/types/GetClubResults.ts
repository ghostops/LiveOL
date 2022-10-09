/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetClubResults
// ====================================================

export interface GetClubResults_results_getClubResults_splits {
  __typename: "OLSplit";
  id: string | null;
  name: string | null;
  time: string | null;
  status: number | null;
  place: number | null;
  timeplus: string | null;
}

export interface GetClubResults_results_getClubResults {
  __typename: "OLResult";
  id: string | null;
  hasSplits: boolean | null;
  start: string | null;
  place: string | null;
  name: string | null;
  club: string | null;
  class: string | null;
  result: string | null;
  status: number | null;
  timeplus: string | null;
  progress: number | null;
  liveRunningStart: string | null;
  splits: (GetClubResults_results_getClubResults_splits | null)[] | null;
}

export interface GetClubResults_results {
  __typename: "ResultsQuery";
  getClubResults: (GetClubResults_results_getClubResults | null)[] | null;
}

export interface GetClubResults {
  results: GetClubResults_results | null;
}

export interface GetClubResultsVariables {
  competitionId: number;
  clubName: string;
}
