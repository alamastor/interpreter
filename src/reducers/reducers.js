/* @flow */
import * as Immutable from "immutable";
import type { Action } from "../actionTypes.js";
import Interpreter from "../interpreter/Interpreter";
import SymbolTableBuilder from "../interpreter/SymbolTable";
import Lexer from "../interpreter/Lexer";
import Parser from "../interpreter/Parser";
import TokenMiddleware from "../TokenMiddleware";
import type { Program } from "../interpreter/Parser";
import type { Token } from "../interpreter/Token";
import type { ASTNode } from "../interpreter/Parser";
import { UnexpectedChar } from "../interpreter/Lexer";
import { UnexpectedToken } from "../interpreter/Parser";
import { InterpreterError } from "../interpreter/Interpreter";

export const CodeState = Immutable.Record(
  ({
    grammar: Immutable.List(),
    code: "",
    ast: null,
    tokenList: Immutable.List(),
    interpreterOutput: "",
  }: {
    grammar: Immutable.List<string>,
    code: string,
    ast: ?ASTNode,
    tokenList: Immutable.List<Token>,
    interpreterOutput: string,
  }),
);

const code = (
  state: CodeState = new CodeState(),
  action: Action,
): CodeState => {
  switch (action.type) {
    case "code_update":
      let tokenList = [];
      try {
        const ast = new Parser(
          new TokenMiddleware(
            new Lexer(action.code),
            () => {
              tokenList = [];
            },
            token => {
              tokenList.push(token);
            },
          ),
        ).parse();
        const interpreterOutput = new Interpreter(ast).interpret();
        return state
          .set("code", action.code)
          .set("grammar", Immutable.List(Parser.grammar))
          .set("interpreterOutput", interpreterOutput)
          .set("tokenList", Immutable.List(tokenList))
          .set("ast", ast);
      } catch (e) {
        if (e instanceof UnexpectedChar) {
          return state
            .set("code", action.code)
            .set("interpreterOutput", "Lexer Error: " + e.message);
        }
        if (e instanceof UnexpectedToken) {
          return state
            .set("code", action.code)
            .set("interpreterOutput", "Parser Error: " + e.message);
        }
        if (e instanceof InterpreterError) {
          return state
            .set("code", action.code)
            .set("interpreterOutput", "Interpreter Error: " + e.message);
        }
        return state.set("code", action.code);
      }
    default:
      return state;
  }
};

const InterpreterViewState = Immutable.Record(
  ({
    highlightStart: 0,
    highlightStop: 0,
    grammarMinimized: true,
    tokensMinimized: true,
    astMinimized: false,
  }: {
    highlightStart: number,
    highlightStop: number,
    grammarMinimized: boolean,
    tokensMinimized: boolean,
    astMinimized: boolean,
  }),
);

const interpreterView = (
  state: InterpreterViewState = new InterpreterViewState(),
  action: Action,
) => {
  switch (action.type) {
    case "token_hover":
      return state
        .set("highlightStart", action.tokenOrError.startPos)
        .set("highlightStop", action.tokenOrError.stopPos);
    case "token_hover_stop":
      return state.set("highlightStart", 0).set("highlightStop", 0);
    case "ast_node_hover":
      return state
        .set("highlightStart", action.node.startPos)
        .set("highlightStop", action.node.stopPos);
    case "ast_node_hover_stop":
      return state.set("highlightStart", 0).set("highlightStop", 0);
    case "interpreter_view_grammar_toggle_click":
      return state.set("grammarMinimized", !state.grammarMinimized);
    case "interpreter_view_tokens_toggle_click":
      return state.set("tokensMinimized", !state.tokensMinimized);
    case "interpreter_view_ast_toggle_click":
      return state.set("astMinimized", !state.astMinimized);
    default:
      return state;
  }
};

export { code, interpreterView };
