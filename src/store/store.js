import { createStore, combineReducers, applyMiddleware } from "redux";

import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import roleReducer from "./reducers/roleReducer";
import settingReducer from "./reducers/settingReducer";
import asinReducer from "./reducers/asinReducer";

const rootReducer = combineReducers({
  role: roleReducer,
  setting: settingReducer,
  asin: asinReducer,
});

const configureStore = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default configureStore;
