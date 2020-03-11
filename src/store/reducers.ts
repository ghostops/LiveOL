import { combineReducers } from 'redux';
import { apiReducer } from './stores/api';
import { generalReducer } from './stores/general';
import { homeReducer } from 'views/scenes/home/store';

export const reducers = combineReducers({
    api: apiReducer,
    home: homeReducer,
    general: generalReducer,
});
