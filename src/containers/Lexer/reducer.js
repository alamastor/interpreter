/* @flow */
import type { Action } from "../../actionTypes.js";

export type LexerState = {
  minimized: boolean,
};
const initialState: LexerState = {
  minimized: true,
};
export default (state: LexerState = initialState, action: Action) => {
  switch (action.type) {
    case "interpreter_view_tokens_toggle_click":
      return Object.assign({}, state, {
        minimized: !state.minimized,
      });
    default:
      return state;
  }
};
