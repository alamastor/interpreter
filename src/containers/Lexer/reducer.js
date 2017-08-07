/* @flow */
import type { Action } from "../../actionTypes.js";
import type { Token } from "../../interpreter/Token";
import { lex } from "../../interpreter/Lexer";

export type LexerState = {
  minimized: boolean,
  tokenList: Array<Token>,
};
const initialState: LexerState = {
  minimized: true,
  tokenList: [],
};
export default (state: LexerState = initialState, action: Action) => {
  switch (action.type) {
    case "code_update":
      return Object.assign({}, state, {
        tokenList: lex(action.code),
      });
    case "interpreter_view_tokens_toggle_click":
      return Object.assign({}, state, {
        minimized: !state.minimized,
      });
    default:
      return state;
  }
};
