declare const clog: (...any) => void;

interface Comp {
    date: string;
    id: number;
    name: string;
    organizer: string;
    timediff: number;
}

interface Classes {
    className: string;
}

interface SplitControl {
    name: string;
    code: number;
}

interface ParsedSplit {
    name: string;
    time: number;
    status: number;
    place: number;
    timeplus: number;
}

interface Class {
    className: string;
    hash: string;
    results: Result[];
    splitcontrols: SplitControl[];
    status: string;
}

interface Result {
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

interface Club {
    clubName: number;
    status: string;
    results: Result[];
    hash: string;
}

interface Passing {
    passtime: string;
    runnerName: string;
    class: string,
    control: number;
    controlName: string;
    time: number;
}

type AvailibleLanguage = 'en' | 'sv' | 'no';
