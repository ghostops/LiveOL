import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLBoolean } from 'graphql';
import { LiveresultatApi } from 'lib/api/types';

export interface IOLSplit {
    id: string;
    name: string;
    time: OLTime;
    status: OLTime;
    place: OLTime;
    timeplus: OLTime;
}

export const marshallSplits = (split: LiveresultatApi.split) => (result: LiveresultatApi.result): IOLSplit => {
    const keys = Object.keys(result.splits);
    const foundKeys = keys.filter((key) => key.includes(String(split.code)));
    const keyValue: Record<string, number> = {};

    for (const key of foundKeys) {
        if (Number(key) === split.code) {
            keyValue['time'] = result.splits[key];
        } else {
            const newKey = key.replace(`${split.code}_`, '');
            keyValue[newKey] = result.splits[key];
        }
    }

    // TODO:
    // PARSE THE NUMBERS TO OLTime
    // GQL WILL FAIL RIGHT NOW

    return {
        id: `${split.code}:${result.name.replace(/ /g, '_')}`,
        name: split.name,
        time: keyValue['time'] || NaN,
        status: keyValue['status'] || NaN,
        place: keyValue['place'] || NaN,
        timeplus: keyValue['timeplus'] || NaN,
    };
};

export const OLSplit = new GraphQLObjectType({
    name: 'OLSplit',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (res: IOLSplit) => res.id,
        },
        name: {
            type: GraphQLString,
            resolve: (res: IOLSplit) => res.name,
        },
        time: {
            type: GraphQLInt,
            resolve: (res: IOLSplit) => res.time,
        },
        status: {
            type: GraphQLInt,
            resolve: (res: IOLSplit) => res.status,
        },
        place: {
            type: GraphQLInt,
            resolve: (res: IOLSplit) => res.place,
        },
        timeplus: {
            type: GraphQLInt,
            resolve: (res: IOLSplit) => res.timeplus,
        },
    }),
});

export interface IOLResult {
    id: string;
    splits: IOLSplit[];
    hasSplits: boolean;
    start: OLTime;

    // unused
    _progress: number;
}

export const marshallResult =
    (comp: number, _class: string, splitControlls: LiveresultatApi.split[]) =>
    (res: LiveresultatApi.result): IOLResult => {
    return {
        id: `${comp}:${_class}`,
        splits: (
            !!splitControlls
            ? splitControlls.map((split) => {
                return marshallSplits(split)(res);
            }) : []
        ),
        hasSplits: Boolean(!!splitControlls && splitControlls.length),
        _progress: res.progress,
        // FIX ME
        start: res.start.toString(),
    };
}

export const OLResult = new GraphQLObjectType({
    name: 'OLResult',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (res: IOLResult) => res.id,
        },
        splits: {
            type: GraphQLList(OLSplit),
            resolve: (res: IOLResult) => res.splits,
        },
        hasSplits: {
            type: GraphQLBoolean,
            resolve: (res: IOLResult) => res.hasSplits,
        },
        start: {
            type: GraphQLString,
            resolve: (res: IOLResult) => res.start,
        },

        // Unused
        _progress: {
            type: GraphQLInt,
            resolve: (res: IOLResult) => res._progress,
        },
    }),
});
