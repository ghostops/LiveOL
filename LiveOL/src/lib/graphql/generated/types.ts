export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ClubsQuery = {
  getAllClubs: Maybe<Array<Maybe<OlClub>>>;
  getClubById: Maybe<OlClub>;
  getClubByName: Maybe<Array<Maybe<OlClub>>>;
};

export type ClubsQueryGetClubByIdArgs = {
  clubId?: InputMaybe<Scalars['Int']>;
};

export type ClubsQueryGetClubByNameArgs = {
  clubName?: InputMaybe<Scalars['String']>;
};

export type CompetitionsQuery = {
  /**
   * We will paginate all future requests
   * @deprecated pagination
   */
  getAllCompetitions: Maybe<Array<Maybe<OlCompetition>>>;
  getCompetition: Maybe<OlCompetition>;
  getCompetitionClasses: Maybe<Array<Maybe<OlClass>>>;
  getCompetitions: Maybe<OlCompetitionResponse>;
};

export type CompetitionsQueryGetCompetitionArgs = {
  competitionId?: InputMaybe<Scalars['Int']>;
};

export type CompetitionsQueryGetCompetitionClassesArgs = {
  competitionId?: InputMaybe<Scalars['Int']>;
};

export type CompetitionsQueryGetCompetitionsArgs = {
  date?: InputMaybe<Scalars['String']>;
  page?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};

export type LastPassingsQuery = {
  getLastPassings: Maybe<Array<Maybe<OlPassing>>>;
};

export type LastPassingsQueryGetLastPassingsArgs = {
  competitionId?: InputMaybe<Scalars['Int']>;
};

export type OlClass = {
  competition: Maybe<Scalars['Int']>;
  id: Maybe<Scalars['String']>;
  name: Maybe<Scalars['String']>;
};

export type OlClub = {
  address: Maybe<Scalars['String']>;
  clubLogoSizes: Maybe<Array<Maybe<Scalars['String']>>>;
  clubLogoUrl: Maybe<Scalars['String']>;
  country: Maybe<Scalars['String']>;
  email: Maybe<Scalars['String']>;
  id: Maybe<Scalars['Int']>;
  name: Maybe<Scalars['String']>;
  website: Maybe<Scalars['String']>;
};

export type OlCompetition = {
  canceled: Maybe<Scalars['Boolean']>;
  club: Maybe<Scalars['String']>;
  clubLogoSizes: Maybe<Array<Maybe<Scalars['String']>>>;
  clubLogoUrl: Maybe<Scalars['String']>;
  date: Maybe<Scalars['String']>;
  distance: Maybe<Scalars['String']>;
  district: Maybe<Scalars['String']>;
  eventor: Maybe<Scalars['Boolean']>;
  id: Maybe<Scalars['Int']>;
  info: Maybe<Scalars['String']>;
  name: Maybe<Scalars['String']>;
  organizer: Maybe<Scalars['String']>;
  signups: Maybe<Scalars['Int']>;
};

export type OlCompetitionResponse = {
  competitions: Maybe<Array<Maybe<OlCompetition>>>;
  lastPage: Maybe<Scalars['Int']>;
  page: Maybe<Scalars['Int']>;
  search: Maybe<Scalars['String']>;
  today: Maybe<Array<Maybe<OlCompetition>>>;
};

export type OlPassing = {
  class: Maybe<Scalars['String']>;
  control: Maybe<Scalars['Int']>;
  controlName: Maybe<Scalars['String']>;
  id: Maybe<Scalars['String']>;
  passtime: Maybe<Scalars['String']>;
  runnerName: Maybe<Scalars['String']>;
  time: Maybe<Scalars['String']>;
};

export type OlResult = {
  class: Maybe<Scalars['String']>;
  club: Maybe<Scalars['String']>;
  hasSplits: Maybe<Scalars['Boolean']>;
  id: Maybe<Scalars['String']>;
  /** @deprecated No longer used */
  liveRunning: Maybe<Scalars['Boolean']>;
  liveRunningStart: Maybe<Scalars['String']>;
  name: Maybe<Scalars['String']>;
  place: Maybe<Scalars['String']>;
  progress: Maybe<Scalars['Float']>;
  result: Maybe<Scalars['String']>;
  splits: Maybe<Array<Maybe<OlSplit>>>;
  start: Maybe<Scalars['String']>;
  status: Maybe<Scalars['Int']>;
  timeplus: Maybe<Scalars['String']>;
};

export type OlSplit = {
  id: Maybe<Scalars['String']>;
  name: Maybe<Scalars['String']>;
  place: Maybe<Scalars['Int']>;
  status: Maybe<Scalars['Int']>;
  time: Maybe<Scalars['String']>;
  timeplus: Maybe<Scalars['String']>;
};

export type OlSplitControl = {
  code: Maybe<Scalars['Int']>;
  id: Maybe<Scalars['String']>;
  name: Maybe<Scalars['String']>;
};

export type Query = {
  clubs: Maybe<ClubsQuery>;
  competitions: Maybe<CompetitionsQuery>;
  lastPassings: Maybe<LastPassingsQuery>;
  results: Maybe<ResultsQuery>;
  server: Maybe<ServerQuery>;
};

export type ResultsQuery = {
  getClubResults: Maybe<Array<Maybe<OlResult>>>;
  getResults: Maybe<Array<Maybe<OlResult>>>;
  getSplitControls: Maybe<Array<Maybe<OlSplitControl>>>;
};

export type ResultsQueryGetClubResultsArgs = {
  clubName?: InputMaybe<Scalars['String']>;
  competitionId?: InputMaybe<Scalars['Int']>;
};

export type ResultsQueryGetResultsArgs = {
  className?: InputMaybe<Scalars['String']>;
  competitionId?: InputMaybe<Scalars['Int']>;
};

export type ResultsQueryGetSplitControlsArgs = {
  className?: InputMaybe<Scalars['String']>;
  competitionId?: InputMaybe<Scalars['Int']>;
};

export type ServerQuery = {
  test: Maybe<Scalars['Boolean']>;
  version: Maybe<Scalars['String']>;
};

export type ClubFragment = {
  id: number;
  name: string;
  country: string;
  address: string;
  website: string;
  email: string;
  clubLogoUrl: string;
  clubLogoSizes: Array<string>;
};

export type CompetitionFragment = {
  id: number;
  name: string;
  organizer: string;
  date: string;
  eventor: boolean;
};

export type EventorCompetitionFragmentFragment = {
  info: string;
  club: string;
  clubLogoUrl: string;
  clubLogoSizes: Array<string>;
  canceled: boolean;
  distance: string;
  district: string;
  signups: number;
};

export type ClassFragment = { id: string; competition: number; name: string };

export type PassingFragment = {
  id: string;
  class: string;
  control: number;
  controlName: string;
  passtime: string;
  runnerName: string;
  time: string;
};

export type SplitControlFragment = { id: string; name: string; code: number };

export type SplitFragment = {
  id: string;
  name: string;
  time: string;
  status: number;
  place: number;
  timeplus: string;
};

export type ResultFragment = {
  id: string;
  hasSplits: boolean;
  start: string;
  place: string;
  name: string;
  club: string;
  class: string;
  result: string;
  status: number;
  timeplus: string;
  progress: number;
  liveRunningStart: string;
  splits: Array<{
    id: string;
    name: string;
    time: string;
    status: number;
    place: number;
    timeplus: string;
  }>;
};

export type GetClubByNameQueryVariables = Exact<{
  name: Scalars['String'];
}>;

export type GetClubByNameQuery = {
  clubs: {
    getClubByName: Array<{
      id: number;
      name: string;
      country: string;
      address: string;
      website: string;
      email: string;
      clubLogoUrl: string;
      clubLogoSizes: Array<string>;
    }>;
  };
};

export type GetCompetitionsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  date?: InputMaybe<Scalars['String']>;
}>;

export type GetCompetitionsQuery = {
  competitions: {
    getCompetitions: {
      page: number;
      lastPage: number;
      search: string;
      today: Array<{
        id: number;
        name: string;
        organizer: string;
        date: string;
        eventor: boolean;
      }>;
      competitions: Array<{
        id: number;
        name: string;
        organizer: string;
        date: string;
        eventor: boolean;
      }>;
    };
  };
};

export type GetCompetitionQueryVariables = Exact<{
  competitionId: Scalars['Int'];
}>;

export type GetCompetitionQuery = {
  competitions: {
    getCompetition: {
      id: number;
      name: string;
      organizer: string;
      date: string;
      eventor: boolean;
      info: string;
      club: string;
      clubLogoUrl: string;
      clubLogoSizes: Array<string>;
      canceled: boolean;
      distance: string;
      district: string;
      signups: number;
    };
    getCompetitionClasses: Array<{
      id: string;
      competition: number;
      name: string;
    }>;
  };
};

export type GetLastPassingsQueryVariables = Exact<{
  competitionId: Scalars['Int'];
}>;

export type GetLastPassingsQuery = {
  lastPassings: {
    getLastPassings: Array<{
      id: string;
      class: string;
      control: number;
      controlName: string;
      passtime: string;
      runnerName: string;
      time: string;
    }>;
  };
};

export type GetResultsQueryVariables = Exact<{
  competitionId: Scalars['Int'];
  className: Scalars['String'];
}>;

export type GetResultsQuery = {
  results: {
    getResults: Array<{
      id: string;
      hasSplits: boolean;
      start: string;
      place: string;
      name: string;
      club: string;
      class: string;
      result: string;
      status: number;
      timeplus: string;
      progress: number;
      liveRunningStart: string;
      splits: Array<{
        id: string;
        name: string;
        time: string;
        status: number;
        place: number;
        timeplus: string;
      }>;
    }>;
  };
};

export type GetSplitControlsQueryVariables = Exact<{
  competitionId: Scalars['Int'];
  className: Scalars['String'];
}>;

export type GetSplitControlsQuery = {
  results: {
    getSplitControls: Array<{ id: string; name: string; code: number }>;
  };
};

export type GetClubResultsQueryVariables = Exact<{
  competitionId: Scalars['Int'];
  clubName: Scalars['String'];
}>;

export type GetClubResultsQuery = {
  results: {
    getClubResults: Array<{
      id: string;
      hasSplits: boolean;
      start: string;
      place: string;
      name: string;
      club: string;
      class: string;
      result: string;
      status: number;
      timeplus: string;
      progress: number;
      liveRunningStart: string;
      splits: Array<{
        id: string;
        name: string;
        time: string;
        status: number;
        place: number;
        timeplus: string;
      }>;
    }>;
  };
};

export type ServerVersionQueryVariables = Exact<{ [key: string]: never }>;

export type ServerVersionQuery = { server: { version: string } };
