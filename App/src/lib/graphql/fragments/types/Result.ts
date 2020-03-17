/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: Result
// ====================================================

export interface Result_splits {
  __typename: "OLSplit";
  id: string | null;
  name: string | null;
  time: number | null;
  status: number | null;
  place: number | null;
  timeplus: number | null;
}

export interface Result {
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
  splits: (Result_splits | null)[] | null;
}
