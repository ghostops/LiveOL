import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { LiveresultatApi } from 'lib/liveresultat/types';

export interface IOLPassing {
  id: string;
  class: string;
  control: number;
  controlName: string;
  passtime: string;
  runnerName: string;
  // is sometimes a string, but should be an int for successful checks
  time: string;
}

export const marshallPassing = (res: LiveresultatApi.passing): IOLPassing => {
  return {
    id: `${res.class.replace(/ /g, '_')}:${res.runnerName.replace(/ /g, '_')}`.toLowerCase(),
    class: res.class,
    controlName: res.controlName,
    control: res.control,
    passtime: res.passtime,
    runnerName: res.runnerName,
    time: res.time,
  };
};

export const OLPassing = new GraphQLObjectType({
  name: 'OLPassing',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: (passing: IOLPassing) => passing.id,
    },
    class: {
      type: GraphQLString,
      resolve: (passing: IOLPassing) => passing.class,
    },
    control: {
      type: GraphQLInt,
      resolve: (passing: IOLPassing) => passing.control,
    },
    controlName: {
      type: GraphQLString,
      resolve: (passing: IOLPassing) => passing.controlName,
    },
    passtime: {
      type: GraphQLString,
      resolve: (passing: IOLPassing) => passing.passtime,
    },
    runnerName: {
      type: GraphQLString,
      resolve: (passing: IOLPassing) => passing.runnerName,
    },
    time: {
      type: GraphQLString,
      resolve: (passing: IOLPassing) => passing.time,
    },
  }),
});
