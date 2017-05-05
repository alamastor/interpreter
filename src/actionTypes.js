/* @flow */
"use strict";
import type { Token } from "./interpreter/Token";
import type { AST } from "./interpreter/Parser";
import { UnexpectedChar } from "./interpreter/Lexer";
import Node from "./ASTStratifier";

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
      ast: AST,
    }
  | {
      type: "ast_node_hover",
      node: Node,
    }
  | {
      type: "ast_node_hover_stop",
    };
