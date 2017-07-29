/* @flow */
import * as Immutable from "immutable";
import type { Action } from "../actionTypes.js";
import Interpreter from "../interpreter/Interpreter";
import Lexer from "../interpreter/Lexer";
import Parser from "../interpreter/Parser";
import TokenMiddleware from "../TokenMiddleware";
import ASTMiddleware from "../ASTMiddleware";
import type { Program } from "../interpreter/Parser";
import type { Token } from "../interpreter/Token";

export const CodeState = Immutable.Record(
  ({
    code: "",
  }: {
    code: string,
  }),
);

const code = (
  state: CodeState = new CodeState(),
  action: Action,
): CodeState => {
  switch (action.type) {
    case "code_update":
      return state.set("code", action.code);
    default:
      return state;
  }
};

const InterpreterViewState = Immutable.Record(
  ({
    grammar: Immutable.List(),
    interpreterOutput: "",
    tokenList: Immutable.List(),
    highlightStart: 0,
    highlightStop: 0,
    grammarMinimized: true,
    tokensMinimized: true,
    astMinimized: false,
  }: {
    grammar: Immutable.List<string>,
    interpreterOutput: string,
    tokenList: Immutable.List<Token>,
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
    case "code_update":
      let tokenList = [];
      const parser = new Parser(
        new TokenMiddleware(
          new Lexer(action.code),
          () => {
            tokenList = [];
          },
          token => {
            tokenList.push(token);
          },
        ),
      );
      let programAST: Program;
      const interpreterOutput = new Interpreter(parser).interpret();

      return state
        .set("grammar", Immutable.List(parser.grammar))
        .set("interpreterOutput", interpreterOutput)
        .set("tokenList", Immutable.List(tokenList));
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
