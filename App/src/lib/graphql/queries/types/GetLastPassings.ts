/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLastPassings
// ====================================================

export interface GetLastPassings_lastPassings_getLastPassings {
  __typename: "OLPassing";
  id: string | null;
  class: string | null;
  control: number | null;
  controlName: string | null;
  passtime: string | null;
  runnerName: string | null;
  time: string | null;
}

export interface GetLastPassings_lastPassings {
  __typename: "LastPassingsQuery";
  getLastPassings: (GetLastPassings_lastPassings_getLastPassings | null)[] | null;
}

export interface GetLastPassings {
  lastPassings: GetLastPassings_lastPassings | null;
}

export interface GetLastPassingsVariables {
  competitionId: number;
}
