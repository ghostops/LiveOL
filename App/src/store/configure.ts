import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { reducers } from 'store/reducers';

interface ConfigureStore {
	store: Store<any>;
}

function configureStore(): ConfigureStore {
	const middleware = applyMiddleware(thunk);
	const enhancer = compose(middleware);

	const store = createStore(reducers, enhancer) as Store<any>;

	return { store };
}

export const store = configureStore();
