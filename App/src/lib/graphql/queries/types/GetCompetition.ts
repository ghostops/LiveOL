/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCompetition
// ====================================================

export interface GetCompetition_competitions_getCompetition {
  __typename: "OLCompetition";
  id: number | null;
  name: string | null;
  organizer: string | null;
  date: string | null;
}

export interface GetCompetition_competitions_getCompetitionClasses {
  __typename: "OLClass";
  id: string | null;
  competition: number | null;
  name: string | null;
}

export interface GetCompetition_competitions {
  __typename: "CompetitionsQuery";
  getCompetition: GetCompetition_competitions_getCompetition | null;
  getCompetitionClasses: (GetCompetition_competitions_getCompetitionClasses | null)[] | null;
}

export interface GetCompetition {
  competitions: GetCompetition_competitions | null;
}

export interface GetCompetitionVariables {
  competitionId: number;
}
