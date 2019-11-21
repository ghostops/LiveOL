import { Cache } from 'lib/cache';
import { getComps } from 'lib/api';

const SET_COMPETITIONS = 'API:SET_COMPETITIONS';

const initialState: ApiReducer = {
    competitions: null,
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
    }

    return state;
}

// Actions //

interface ICache {
    competitions: Cache<Comp[]>;
}

const caches: ICache = {
    competitions: new Cache('visibleCompetitions', 60000),
};

export const loadCompetitions = () => async (dispatch) => {
    const cache = caches.competitions;

    let allCompetitions = await cache.get();

    if (!allCompetitions) {
        allCompetitions = await getComps();
        await cache.set(allCompetitions);
    }

    dispatch({
        type: SET_COMPETITIONS,
        value: allCompetitions,
    });
};
