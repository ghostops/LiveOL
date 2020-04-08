/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AllCompetitions
// ====================================================

export interface AllCompetitions_competitions_getAllCompetitions {
  __typename: "OLCompetition";
  id: number | null;
  name: string | null;
  organizer: string | null;
  date: string | null;
  eventor: boolean | null;
}

export interface AllCompetitions_competitions {
  __typename: "CompetitionsQuery";
  getAllCompetitions: (AllCompetitions_competitions_getAllCompetitions | null)[] | null;
}

export interface AllCompetitions {
  competitions: AllCompetitions_competitions | null;
}
