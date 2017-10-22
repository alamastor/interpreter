/* @flow */
"use strict";
import type { Token } from "./interpreter/Token";
import type { Node } from "./containers/ASTView/Stratifier";
import type { ParserOutput, Program } from "./interpreter/Parser";

export type Action =
  | {
      type: "code_update",
      code: string,
    }
  | {
      type: "token_list_reset",
    }
  | {
      type: "token_list_push",
      token: Token,
    }
  | {
      type: "token_hover",
      token: Token,
    }
  | {
      type: "token_hover_stop",
    }
  | {
      type: "interpreter_output_update",
      output: string,
    }
  | {
      type: "parser_grammar_update",
      grammar: Array<string>,
    }
  | {
      type: "interpreter_view_grammar_toggle_click",
    }
  | {
      type: "interpreter_view_tokens_toggle_click",
    }
  | {
      type: "interpreter_view_ast_toggle_click",
    }
  | {
      type: "interpreter_view_symbol_table_toggle_click",
    }
  | {
      type: "interpreter_received_parser_output",
      parserOutput: ParserOutput,
    }
  | {
      type: "ast_view_node_hover",
      node: Node,
    }
  | {
      type: "ast_view_node_hover_stop",
    }
  | {
      type: "ast_view_node_click",
      node: Node,
    }
  | {
      type: "ast_view_received_ast",
      ast: ?Program,
    };
