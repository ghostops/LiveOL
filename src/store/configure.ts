import thunk from 'redux-thunk';
// import { AsyncStorage } from 'react-native';
// import { persistReducer, persistStore } from 'redux-persist';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { reducers } from 'store/reducers';

interface ConfigureStore {
    // persistor: any;
    store: Store<any>;
}

// const persistedReducer = persistReducer(
//     {
//         storage: AsyncStorage,
//         key: 'liveol',
//     },
//     reducers,
// );

function configureStore(onCompletion?: () => void): ConfigureStore {
    const middleware = applyMiddleware(thunk);
    const enhancer = compose(middleware);

    const store = createStore(reducers, enhancer) as Store<any>;
    // const persistor = persistStore(store);

    return { store };
}

export const store = configureStore();
