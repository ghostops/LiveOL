import allCompsMock from './mock/comps';

const ROOT = 'https://ghst-jsonp.herokuapp.com';

export const getComps = async (): Promise<Comp[]> => {
    if (__DEV__) {
        return JSON.parse(allCompsMock).slice(0, 100);
    }

    const url = ROOT + '/api.php?method=getcompetitions';

    const data = await fetch(url).then((resp) => resp.json());
    
    return data.competitions;
};

export const getComp = async (id: number) => {
    const url = ROOT + '/api.php?method=getcompetitioninfo&comp=' + id;

    const data = await fetch(url).then((resp) => resp.json());
    
    return data;
};

export const getClasses = async (id: number) => {
    const url = ROOT + '/api.php?method=getclasses&comp=' + id;

    const data = await fetch(url).then((resp) => resp.json());
    
    return data['classes'];
};

export const getClass = async (id: number, className: string) => {
    const url = ROOT + `/api.php?method=getclassresults&comp=${id}&class=${className}`;

    const data = await fetch(url).then((resp) => resp.json());
    
    return data;
};

export const getClub = async (id: number, clubName: string) => {
    const url = ROOT + `/api.php?method=getclubresults&comp=${id}&club=${clubName}`;

    const data = await fetch(url).then((resp) => resp.json());
    
    return data;
};

export const getPasses = async (id: number) => {
    const url = ROOT + `/api.php?method=getlastpassings&comp=${id}`;

    const data = await fetch(url).then((resp) => resp.json());
    
    return data['passings'];
};
