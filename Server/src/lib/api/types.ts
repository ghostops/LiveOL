export declare namespace LiveresultatApi {
    export interface hashed {
        last_hash: string;
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
}
