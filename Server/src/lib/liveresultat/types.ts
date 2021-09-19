export declare namespace LiveresultatApi {
	export interface hashed {
		hash: string;
		status: 'OK' | 'NOT MODIFIED';
	}

	export interface getcompetitions {
		competitions: competition[];
	}

	export interface competition {
		date: string;
		id: number;
		name: string;
		organizer: string;
		timediff: number;
	}

	export interface getclasses extends hashed {
		classes: _class[];
	}

	export interface _class {
		className: string;
	}

	export interface getclassresults extends hashed {
		className: string;
		splitcontrols: split[];
		results: result[];
		DT_RowClass?: 'new_result';
	}

	export interface result {
		place: string;
		name: string;
		club: string;
		class: string;
		result: string;
		status: number;
		timeplus: string;
		progress: number;
		start: number;
		splits: Record<string, number>;
	}

	export interface split {
		code: number;
		name: string;
	}

	export interface lastpassings extends hashed {
		passings: passing[];
	}

	export interface passing {
		passtime: string;
		runnerName: string;
		class: string;
		control: number;
		controlName: string;
		time: string;
	}

	export interface getclubresults extends hashed {
		clubName: string;
		results: result[];
		hash: string;
	}
}
