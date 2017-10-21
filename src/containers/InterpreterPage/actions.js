/* @flow */
import type { Action } from "../../actionTypes";
import type { ParserOutput } from "../../interpreter/Parser";

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

export const onReceiveParserOutput = (parserOutput: ParserOutput): Action => ({
  type: "interpreter_received_parser_output",
  parserOutput: parserOutput,
});
