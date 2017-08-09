/* @flow */
import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { code, interpreter } from "./reducers/reducers";
import lexer from "./containers/Lexer/reducer";
import ast from "./containers/AST/reducer";
import { loadState, saveState } from "./localStorage";
import type { Action } from "./actionTypes";
import type { Dispatch as ReduxDispatch } from "redux";
import throttle from "lodash/throttle";

const reducers = {
  code,
  interpreter,
  ast,
  lexer,
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

type GetState = () => Action;
/* eslint-disable no-use-before-define */
export type Dispatch = ReduxDispatch<Action> & Thunk<Action>;
/* eslint-enable no-use-before-define */
type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;
export default store;
