
import { Cache } from 'lib/cache';
import * as API from 'lib/api';

const SET_COMPETITIONS = 'API:SET_COMPETITIONS';
const SET_CLASSES = 'API:SET_CLASSES';

const initialState: ApiReducer = {
    competitions: null,
    classes: null,
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
    }

    return state;
}

// Actions //

interface ICache {
    competitions: Cache<Comp[]>;
    competition: (id: number) => Cache<Classes>;
}

const caches: ICache = {
    competitions: new Cache('visibleCompetitions', 60000),
    competition: (id) => new Cache(`comp:${id}`, 3600000),
};

export const loadCompetitions = () => async (dispatch) => {
    const cache = caches.competitions;

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

    const cache = caches.competition(id);

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
