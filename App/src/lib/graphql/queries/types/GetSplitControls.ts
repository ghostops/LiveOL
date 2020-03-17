/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSplitControls
// ====================================================

export interface GetSplitControls_results_getSplitControls {
  __typename: "OLSplitControl";
  id: string | null;
  name: string | null;
  code: number | null;
}

export interface GetSplitControls_results {
  __typename: "ResultsQuery";
  getSplitControls: (GetSplitControls_results_getSplitControls | null)[] | null;
}

export interface GetSplitControls {
  results: GetSplitControls_results | null;
}

export interface GetSplitControlsVariables {
  competitionId: number;
  className: string;
}
