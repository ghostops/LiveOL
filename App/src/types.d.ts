declare const clog: (...any) => void;

interface _Comp {
    date: string;
    id: number;
    name: string;
    organizer: string;
    timediff: number;
}

interface _Classes {
    className: string;
}

interface _SplitControl {
    name: string;
    code: number;
}

interface _ParsedSplit {
    name: string;
    time: number;
    status: number;
    place: number;
    timeplus: number;
}

interface _OLClass {
    className: string;
    hash: string;
    results: Result[];
    splitcontrols: SplitControl[];
    status: string;
}

interface _Result {
    club: string;
    name: string;
    place: string;
    progress: number;
    result: string;
    start: number;
    status: number;
    timeplus: string;
    class?: string;
    splits?: Record<string, number>;
    parsedSplits?: ParsedSplit[];
}

interface _Club {
    clubName: number;
    status: string;
    results: Result[];
    hash: string;
}

interface _Passing {
    passtime: string;
    runnerName: string;
    class: string,
    control: number;
    controlName: string;
    time: number;
}

type AvailibleLanguage = 'en' | 'sv' | 'no';
