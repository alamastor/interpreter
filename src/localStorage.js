/* @flow */
import * as Immutable from "immutable";
import { CodeState } from "./reducers";

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState != null) {
      // TODO: Maybe replace records with maps so can generalize this.
      const jsState = JSON.parse(serializedState);
      return { code: CodeState(jsState.code) };
    } else {
      return undefined;
    }
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (err) {
    console.log("failed to save state to localstorage.");
  }
};