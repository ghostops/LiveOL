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

interface Class {
    className: string;
    hash: string;
    results: Result[];
    splitcontrols: any[];
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

type AvailibleLanguage = 'en' | 'sv';
