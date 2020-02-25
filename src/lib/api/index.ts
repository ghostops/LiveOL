// const ROOT = 'https://liveol.larsendahl.se';
const ROOT = 'http://localhost:3000';

export const getComps = async (): Promise<Comp[]> => {
    const url = `${ROOT}/api.php?method=getcompetitions`;

    const data = await fetch(url).then((resp) => resp.json());

    return data['competitions'];
};

export const getComp = async (id: number): Promise<Comp> => {
    const url = `${ROOT}/api.php?method=getcompetitioninfo&comp=${id}`;

    const data = await fetch(url).then((resp) => resp.json());

    return data;
};

export const getClasses = async (id: number): Promise<Classes> => {
    const url = `${ROOT}/api.php?method=getclasses&comp=${id}`;

    const data = await fetch(url).then((resp) => resp.json());

    return data['classes'];
};

export const getClass = async (id: number, className: string): Promise<Class> => {
    const url = `${ROOT}/api.php?method=getclassresults&comp=${id}&class=${className}`;

    const data = await fetch(url).then((resp) => resp.json());

    return data;
};

export const getClub = async (id: number, clubName: string): Promise<Club> => {
    const url = `${ROOT}/api.php?method=getclubresults&comp=${id}&club=${clubName}`;

    const data = await fetch(url).then((resp) => resp.json());

    return data;
};

export const getPasses = async (id: number): Promise<Passing[]> => {
    const url = `${ROOT}/api.php?method=getlastpassings&comp=${id}`;

    const data = await fetch(url).then((resp) => resp.json());

    return data['passings'];
};
