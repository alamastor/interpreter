/* @flow */
import type { Action } from "../../actionTypes";
import { UnexpectedToken } from "../../interpreter/Parser";
import type { Program } from "../../interpreter/Parser";

export const onSetCode = (code: string): Action => ({
  type: "code_update",
  code: code,
});

export const onClickGrammarToggle = (): Action => ({
  type: "interpreter_view_grammar_toggle_click",
});

export const onClickASTToggle = (): Action => ({
  type: "interpreter_view_ast_toggle_click",
});

export const onClickSymbolTableToggle = (): Action => ({
  type: "interpreter_view_symbol_table_toggle_click",
});

export const onReceiveAST = (ast: ?Program | UnexpectedToken): Action => ({
  type: "interpreter_received_ast",
  ast: ast,
});
