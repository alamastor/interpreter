/* @flow */
import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { code, interpreterView } from "./reducers/reducers";
import astView from "./containers/AST/reducer";
import { loadState, saveState } from "./localStorage";
import throttle from "lodash/throttle";

const reducer = combineReducers({
  code,
  interpreterView,
  astView,
});

const persistedState = loadState();

const store = createStore(reducer, persistedState, applyMiddleware(thunk));

store.subscribe(
  throttle(() => {
    saveState(store.getState());
  }),
);

export default store;
