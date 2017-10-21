/* @flow */
"use strict";
import type { Token } from "./interpreter/Token";
import type { Node } from "./containers/AST/Stratifier";
import type { ParserOutput } from "./interpreter/Parser";

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
      type: "ast_node_hover",
      node: Node,
    }
  | {
      type: "ast_node_hover_stop",
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
      type: "ast_node_click",
      node: Node,
    }
  | {
      type: "ast_received_next_strata",
      strata: Node,
    }
  | {
      type: "ast_received_token_list",
      tokenList: Array<Token>,
    };
