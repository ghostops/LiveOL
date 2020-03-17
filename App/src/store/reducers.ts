import { combineReducers } from 'redux';
import { generalReducer } from './stores/general';
import { homeReducer } from 'views/scenes/home/store';

export const reducers = combineReducers({
    home: homeReducer,
    general: generalReducer,
});
