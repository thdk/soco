import { combineReducers } from 'redux';
//import { routerReducer } from 'react-router-redux';

import { ideas } from '../../src/ts/reducers/ideaReducer';

const rootReducer = combineReducers({ideas});

export default rootReducer;
