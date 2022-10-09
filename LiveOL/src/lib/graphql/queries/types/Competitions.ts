/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Competitions
// ====================================================

export interface Competitions_competitions_getCompetitions_today {
  __typename: "OLCompetition";
  id: number | null;
  name: string | null;
  organizer: string | null;
  date: string | null;
  eventor: boolean | null;
}

export interface Competitions_competitions_getCompetitions_competitions {
  __typename: "OLCompetition";
  id: number | null;
  name: string | null;
  organizer: string | null;
  date: string | null;
  eventor: boolean | null;
}

export interface Competitions_competitions_getCompetitions {
  __typename: "OLCompetitionResponse";
  page: number | null;
  lastPage: number | null;
  search: string | null;
  today: (Competitions_competitions_getCompetitions_today | null)[] | null;
  competitions: (Competitions_competitions_getCompetitions_competitions | null)[] | null;
}

export interface Competitions_competitions {
  __typename: "CompetitionsQuery";
  getCompetitions: Competitions_competitions_getCompetitions | null;
}

export interface Competitions {
  competitions: Competitions_competitions | null;
}

export interface CompetitionsVariables {
  page?: number | null;
  search?: string | null;
  date?: string | null;
}
