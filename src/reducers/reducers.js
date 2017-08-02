/* @flow */
import * as Immutable from "immutable";
import type { Action } from "../actionTypes.js";
import TokenMiddleware from "../TokenMiddleware";
import type { Program } from "../interpreter/Parser";
import type { Token } from "../interpreter/Token";
import type { ASTNode } from "../interpreter/Parser";
import Lexer, { UnexpectedChar } from "../interpreter/Lexer";
import Parser, { UnexpectedToken } from "../interpreter/Parser";
import Interpreter, { InterpreterError } from "../interpreter/Interpreter";
import SemanticAnalyzer, { NameError } from "../interpreter/SemanticAnalyzer";
import type { ASTSymbol } from "../interpreter/SymbolTable";

export const CodeState = Immutable.Record(
  ({
    grammar: Immutable.List(),
    code: "",
    tokenList: Immutable.List(),
    ast: null,
    symbolTable: new Map(),
    interpreterOutput: "",
  }: {
    grammar: Immutable.List<string>,
    code: string,
    tokenList: Immutable.List<Token>,
    ast: ?ASTNode,
    symbolTable: Map<string, ASTSymbol>,
    interpreterOutput: string,
  }),
);

const code = (
  state: CodeState = new CodeState(),
  action: Action,
): CodeState => {
  switch (action.type) {
    case "code_update":
      console.log(action.code);
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
        const semanticAnalyzer = new SemanticAnalyzer();
        semanticAnalyzer.visitProgram(ast);
        const interpreterOutput = new Interpreter(ast).interpret();
        return state
          .set("code", action.code)
          .set("grammar", Immutable.List(Parser.grammar))
          .set("interpreterOutput", interpreterOutput)
          .set("tokenList", Immutable.List(tokenList))
          .set("symbolTable", semanticAnalyzer.table.symbols)
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
        if (e instanceof NameError) {
          return state
            .set("code", action.code)
            .set("interpreterOutput", "Name Error: " + e.message);
        }
        return state
          .set("code", action.code)
          .set("interpreterOutput", "Unexpected Error: " + e.message);
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
    astMinimized: true,
    symbolTableMinimized: true,
  }: {
    highlightStart: number,
    highlightStop: number,
    grammarMinimized: boolean,
    tokensMinimized: boolean,
    astMinimized: boolean,
    symbolTableMinimized: boolean,
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
    case "interpreter_view_symbol_table_toggle_click":
      return state.set("symbolTableMinimized", !state.symbolTableMinimized);
    default:
      return state;
  }
};

export { code, interpreterView };
