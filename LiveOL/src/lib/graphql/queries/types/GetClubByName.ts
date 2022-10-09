/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetClubByName
// ====================================================

export interface GetClubByName_clubs_getClubByName {
  __typename: "OLClub";
  id: number | null;
  name: string | null;
  country: string | null;
  address: string | null;
  website: string | null;
  email: string | null;
  clubLogoUrl: string | null;
  clubLogoSizes: (string | null)[] | null;
}

export interface GetClubByName_clubs {
  __typename: "ClubsQuery";
  getClubByName: GetClubByName_clubs_getClubByName | null;
}

export interface GetClubByName {
  clubs: GetClubByName_clubs | null;
}

export interface GetClubByNameVariables {
  name: string;
}
