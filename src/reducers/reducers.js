/* @flow */
import type { Action } from "../actionTypes.js";
import TokenMiddleware from "../TokenMiddleware";
import type { Token } from "../interpreter/Token";
import type { ASTNode } from "../interpreter/Parser";
import Lexer, { UnexpectedChar } from "../interpreter/Lexer";
import Parser, { UnexpectedToken } from "../interpreter/Parser";
import Interpreter, { InterpreterError } from "../interpreter/Interpreter";
import SemanticAnalyzer, {
  SemanticError,
} from "../interpreter/SemanticAnalyzer";
import type { ASTSymbol } from "../interpreter/ASTSymbol";

export type CodeState = {
  grammar: Array<string>,
  code: string,
  tokenList: Array<Token | UnexpectedChar>,
  ast: ?ASTNode,
  symbolTable: { [string]: ASTSymbol },
  interpreterOutput: string,
};
const initialState = {
  grammar: [],
  code: "",
  tokenList: [],
  ast: null,
  symbolTable: {},
  interpreterOutput: "",
};

const code = (state: CodeState = initialState, action: Action): CodeState => {
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
        const semanticAnalyzer = new SemanticAnalyzer();
        semanticAnalyzer.visitProgram(ast);
        const interpreterOutput = new Interpreter(ast).interpret();
        return Object.assign({}, state, {
          code: action.code,
          grammar: Parser.grammar,
          interpreterOutput: interpreterOutput,
          tokenList: tokenList,
          symbolTable: semanticAnalyzer.currentScope.symbols,
          ast: ast,
        });
      } catch (e) {
        if (e instanceof UnexpectedChar) {
          return Object.assign({}, state, {
            code: action.code,
            interpreterOutput: "Lexer Error: " + e.message,
          });
        }
        if (e instanceof UnexpectedToken) {
          return Object.assign({}, state, {
            code: action.code,
            interpreterOutput: "Parser Error: " + e.message,
          });
        }
        if (e instanceof InterpreterError) {
          return Object.assign({}, state, {
            code: action.code,
            interpreterOutput: "Interpreter Error: " + e.message,
          });
        }
        if (e instanceof SemanticError) {
          return Object.assign({}, state, {
            code: action.code,
            interpreterOutput: "Name Error: " + e.message,
          });
        }
        return Object.assign({}, state, {
          code: action.code,
          interpreterOutput: "Unexpected Error: " + e.message,
        });
      }
    default:
      return state;
  }
};

type InterpreterViewState = {
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  tokensMinimized: boolean,
  astMinimized: boolean,
  symbolTableMinimized: boolean,
};

const interpreterViewInitialState: InterpreterViewState = {
  highlightStart: 0,
  highlightStop: 0,
  grammarMinimized: true,
  tokensMinimized: true,
  astMinimized: true,
  symbolTableMinimized: true,
};

const interpreterView = (
  state: InterpreterViewState = interpreterViewInitialState,
  action: Action,
) => {
  switch (action.type) {
    case "token_hover":
      return Object.assign({}, state, {
        highlightStart: action.tokenOrError.startPos,
        highlightStop: action.tokenOrError.stopPos,
      });
    case "token_hover_stop":
      return Object.assign({}, state, {
        highlightStart: 0,
        highlightStop: 0,
      });
    case "ast_node_hover":
      return Object.assign({}, state, {
        highlightStart: action.node.startPos,
        highlightStop: action.node.stopPos,
      });
    case "ast_node_hover_stop":
      return Object.assign({}, state, {
        highlightStart: 0,
        highlightStop: 0,
      });
    case "interpreter_view_grammar_toggle_click":
      return Object.assign({}, state, {
        grammarMinimized: !state.grammarMinimized,
      });
    case "interpreter_view_tokens_toggle_click":
      return Object.assign({}, state, {
        tokensMinimized: !state.tokensMinimized,
      });
    case "interpreter_view_ast_toggle_click":
      return Object.assign({}, state, {
        astMinimized: !state.astMinimized,
      });
    case "interpreter_view_symbol_table_toggle_click":
      return Object.assign({}, state, {
        symbolTableMinimized: !state.symbolTableMinimized,
      });
    default:
      return state;
  }
};

export { code, interpreterView };
