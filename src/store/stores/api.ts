
import { Cache } from 'lib/cache';
import * as API from 'lib/api';

const SET_COMPETITIONS = 'API:SET_COMPETITIONS';
const SET_CLASSES = 'API:SET_CLASSES';
const SET_RESULTS = 'API:SET_RESULTS';
const SET_LAST_PASSINGS = 'API:SET_LAST_PASSINGS';

const initialState: ApiReducer = {
    competitions: null,
    classes: null,
    results: null,
    lastPassings: null,
};

export function apiReducer(
    state: ApiReducer = initialState,
    action: DispatchAction<any>,
): ApiReducer {
    switch (action.type) {
    case SET_COMPETITIONS:
        return {
            ...state,
            competitions: action.value,
        };
    case SET_CLASSES:
        return {
            ...state,
            classes: action.value,
        };
    case SET_RESULTS:
        return {
            ...state,
            results: action.value,
        };
    case SET_LAST_PASSINGS:
        return {
            ...state,
            lastPassings: action.value,
        };
    }

    return state;
}

// Actions //

interface ICache {
    competitions: Cache<Comp[]>;
    competition: (id: number) => Cache<Classes>;
    results: (id: string) => Cache<Class>;
    lastPassings: (id: string) => Cache<Passing[]>;
}

export const API_CACHES: ICache = {
    competitions: new Cache('visibleCompetitions', 60000),
    competition: (id) => new Cache(`comp:${id}`, 3600000),
    results: (id) => new Cache(`results:${id}`, 15000),
    lastPassings: (id) => new Cache(`lastpassings:${id}`, 15000),
};

export const loadCompetitions = () => async (dispatch) => {
    const cache = API_CACHES.competitions;

    let allCompetitions = await cache.get();

    if (!allCompetitions) {
        allCompetitions = await API.getComps();
        await cache.set(allCompetitions);
    }

    dispatch({
        type: SET_COMPETITIONS,
        value: allCompetitions,
    });
};

export const getCompetition = (id: number) => async (dispatch) => {
    dispatch({
        type: SET_CLASSES,
        value: null,
    });

    const cache = API_CACHES.competition(id);

    let classes: Classes;

    const data = await cache.get();

    if (!data) {
        classes = await API.getClasses(id);

        await cache.set(classes);
    } else {
        classes = data;
    }

    dispatch({
        type: SET_CLASSES,
        value: classes,
    });
};

export const getResults = (id: number, className: string) => async (dispatch) => {
    const cache = API_CACHES.results(`class:${id}:${className}`);

    let results: Class = await cache.get();

    if (!results) {
        results = await API.getClass(id, className);
        await cache.set(results);
    }

    dispatch({
        type: SET_RESULTS,
        value: results,
    });
};

export const getLastPassings = (id: number) => async (dispatch) => {
    const cache = API_CACHES.lastPassings(`comp:${id}`);

    let results: Passing[] = await cache.get();

    if (!results) {
        results = await API.getPasses(id);
        await cache.set(results);
    }

    dispatch({
        type: SET_LAST_PASSINGS,
        value: results,
    });
};
