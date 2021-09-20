import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLBoolean, GraphQLFloat } from 'graphql';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { OLTime } from 'types';
import * as Helpers from 'lib/helpers/time';
import * as _ from 'lodash';

export interface IOLSplit {
	id: string;
	name: string;
	status: number;
	place: number;
	time: OLTime;
	timeplus: OLTime;
}

const parsePlace = (place: any): number => {
	if (_.isNumber(place)) {
		return place;
	} else if (place.trim() === '-') {
		return -1;
	}

	return 0;
};

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

	return {
		id: `${split.code}:${result.name.replace(/ /g, '_')}`,
		name: split.name,
		time: Helpers.splitTimestampToReadable(keyValue['time'] || 0),
		status: keyValue['status'] || NaN,
		place: parsePlace(keyValue['place'] || 0),
		timeplus: Helpers.timeplusToReadable(keyValue['timeplus'] || 0),
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
			type: GraphQLString,
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
			type: GraphQLString,
			resolve: (res: IOLSplit) => res.timeplus,
		},
	}),
});

export interface IOLResult {
	id: string;
	splits: IOLSplit[];
	hasSplits: boolean;
	start: OLTime;
	place: string;
	name: string;
	club?: string;
	class?: string;
	result: string;
	status: number;
	timeplus: string;

	liveRunning: boolean;
	liveRunningStart: string;

	progress: number;
}

export const marshallResult = (comp: number, _class: string, splitControlls: LiveresultatApi.split[]) => (
	res: LiveresultatApi.result,
): IOLResult => {
	const liveRunningDate = Helpers.getLiveRunningStart(res.start);

	return {
		id: `${comp}:${_class}:${res.name.replace(/ /g, '_')}`,
		splits: !!splitControlls
			? splitControlls.map((split) => {
					return marshallSplits(split)(res);
			  })
			: [],
		hasSplits: Boolean(!!splitControlls && splitControlls.length),
		start: Helpers.startToReadable(res.start),

		place: res.place,
		club: res?.club,
		class: res?.class || _class,
		name: res.name,
		result: res.result,
		status: res.status,
		timeplus: res.timeplus,
		liveRunningStart: liveRunningDate.format(),
		progress: res.progress,

		// deprecated
		liveRunning: res.progress < 100,
	};
};

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
		place: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.place,
		},
		name: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.name,
		},
		club: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.club,
		},
		class: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.class,
		},
		result: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.result,
		},
		status: {
			type: GraphQLInt,
			resolve: (res: IOLResult) => res.status,
		},
		timeplus: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.timeplus,
		},
		progress: {
			type: GraphQLFloat,
			resolve: (res: IOLResult) => res.progress,
		},

		liveRunning: {
			type: GraphQLBoolean,
			deprecationReason: 'No longer used',
			resolve: (res: IOLResult) => res.liveRunning,
		},
		liveRunningStart: {
			type: GraphQLString,
			resolve: (res: IOLResult) => res.liveRunningStart,
		},
	}),
});

export interface IOLSplitControl {
	id: string;
	code: number;
	name: string;
}

export const marshallSplitControl = (res: LiveresultatApi.split): IOLSplitControl => ({
	id: `${res.code}`,
	code: res.code,
	name: res.name,
});

export const OLSplitControl = new GraphQLObjectType({
	name: 'OLSplitControl',
	fields: () => ({
		id: {
			type: GraphQLString,
			resolve: (res: IOLSplitControl) => res.id,
		},
		code: {
			type: GraphQLInt,
			resolve: (res: IOLSplitControl) => res.code,
		},
		name: {
			type: GraphQLString,
			resolve: (res: IOLSplitControl) => res.name,
		},
	}),
});
