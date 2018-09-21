import { createStore, applyMiddleware } from 'redux';

import { composeEnhancers } from './utils';
import rootReducer from './root-reducer';
import thunk from 'redux-thunk';

function configureStore(initialState?: object) {
  // configure middlewares
  const middlewares = [thunk];
  // compose enhancers
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));
  // create store
  return createStore(rootReducer, initialState!, enhancer);
}

// pass an optional param to rehydrate state on app start
const store = configureStore();

// export store singleton instance
export default store;
