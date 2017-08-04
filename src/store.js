/* @flow */
import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { code, interpreterView } from "./reducers/reducers";
import astView from "./containers/AST/reducer";
import { loadState, saveState } from "./localStorage";
import throttle from "lodash/throttle";

const reducers = {
  code,
  interpreterView,
  astView,
};
const reducer = combineReducers(reducers);
type Reducers = typeof reducers;
type $ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;
export type State = $ObjMap<Reducers, $ExtractFunctionReturn>;

const persistedState = loadState();

const store = createStore(reducer, persistedState, applyMiddleware(thunk));

store.subscribe(
  throttle(() => {
    saveState(store.getState());
  }),
);

export default store;
