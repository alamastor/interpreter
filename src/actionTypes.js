/* @flow */
"use strict";
import type { Token } from "./interpreter/Token";
import { UnexpectedChar } from "./interpreter/Lexer";
import type { Node } from "./containers/AST/Stratifier";
import type { Program } from "./interpreter/Parser";

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
      tokenOrError: Token | UnexpectedChar,
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
      type: "parser_ast_update",
      ast: Program,
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
      type: "ast_node_click",
      node: Node,
    }
  | {
      type: "ast_received_next_strata",
      strata: Node,
    }
  | {
      type: "ast_received_ast",
      ast: Program,
    };
