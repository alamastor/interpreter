/* @flow */
import type { Action } from "../../actionTypes.js";
import Parser from "../../interpreter/Parser";
import type { Program } from "../../interpreter/Parser";
import { lex } from "../../interpreter/Lexer";
import type { Token } from "../../interpreter/Token";
import Interpreter from "../../interpreter/Interpreter";
import SemanticAnalyzer from "../../interpreter/SemanticAnalyzer";
import type { ASTSymbol } from "../../interpreter/ASTSymbol";
import defaultPascalCode from "./defaultPascalCode";

type InterpreterPageState = {
  code: string,
  tokenList: Array<Token>,
  ast: ?Program,
  symbolTable: { [string]: ASTSymbol },
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  tokensMinimized: boolean,
  astMinimized: boolean,
  symbolTableMinimized: boolean,
  interpreterOutput: string,
};

const interpreterPageInitialState: InterpreterPageState = {
  code: defaultPascalCode,
  tokenList: [],
  ast: null,
  symbolTable: {},
  highlightStart: 0,
  highlightStop: 0,
  grammarMinimized: true,
  tokensMinimized: true,
  astMinimized: false,
  symbolTableMinimized: true,
  interpreterOutput: "",
};

export default (
  state: InterpreterPageState = interpreterPageInitialState,
  action: Action,
) => {
  switch (action.type) {
    case "token_hover":
      return Object.assign({}, state, {
        highlightStart: action.token.startPos,
        highlightStop: action.token.stopPos,
      });

    case "token_hover_stop":
      return Object.assign({}, state, {
        highlightStart: 0,
        highlightStop: 0,
      });

    case "ast_view_node_hover":
      return Object.assign({}, state, {
        highlightStart: action.node.startPos,
        highlightStop: action.node.stopPos,
      });

    case "ast_view_node_hover_stop":
      return Object.assign({}, state, {
        highlightStart: 0,
        highlightStop: 0,
      });

    case "interpreter_view_grammar_toggle_click":
      return Object.assign({}, state, {
        grammarMinimized: !state.grammarMinimized,
      });

    case "interpreter_view_ast_toggle_click":
      return Object.assign({}, state, {
        astMinimized: !state.astMinimized,
      });

    case "interpreter_view_symbol_table_toggle_click":
      return Object.assign({}, state, {
        symbolTableMinimized: !state.symbolTableMinimized,
      });

    case "code_update":
      const tokenList = lex(action.code);
      const parserOutput = new Parser(tokenList).parse();
      const ast = parserOutput.ast;
      if (ast == null) {
        return Object.assign({}, state, {
          code: action.code,
          tokenList: tokenList,
          ast: ast,
          interpreterOutput: parserOutput.error,
          symbolTable: {},
        });
      }
      const semanticAnalyzer = new SemanticAnalyzer();
      const semanticError = semanticAnalyzer.check(ast);
      if (semanticError != null) {
        return Object.assign({}, state, {
          code: action.code,
          tokenList: tokenList,
          ast: ast,
          interpreterOutput: semanticError,
          symbolTable: {},
        });
      }
      const interpreterOutput = new Interpreter(ast).interpret();

      return Object.assign({}, state, {
        code: action.code,
        tokenList: tokenList,
        ast: ast,
        interpreterOutput: interpreterOutput,
        symbolTable: {},
      });

    default:
      return state;
  }
};
