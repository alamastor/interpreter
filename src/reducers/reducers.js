/* @flow */
import type { Action } from "../actionTypes.js";
import Parser, { UnexpectedToken } from "../interpreter/Parser";
import Interpreter, { InterpreterError } from "../interpreter/Interpreter";
import SemanticAnalyzer, {
  SemanticError,
} from "../interpreter/SemanticAnalyzer";
import type { ASTSymbol } from "../interpreter/ASTSymbol";

export type CodeState = {
  grammar: Array<string>,
  code: string,
  symbolTable: { [string]: ASTSymbol },
  interpreterOutput: string,
};
const initialState = {
  grammar: [],
  code: "",
  symbolTable: {},
  interpreterOutput: "",
};

const code = (state: CodeState = initialState, action: Action): CodeState => {
  switch (action.type) {
    case "code_update":
      return Object.assign({}, state, {
        code: action.code,
      });

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
    case "interpreter_view_ast_toggle_click":
      return Object.assign({}, state, {
        astMinimized: !state.astMinimized,
      });
    case "interpreter_view_symbol_table_toggle_click":
      return Object.assign({}, state, {
        symbolTableMinimized: !state.symbolTableMinimized,
      });
    case "interpreter_recieved_ast":
      try {
        const semanticAnalyzer = new SemanticAnalyzer();
        semanticAnalyzer.visitProgram(action.ast);
        const interpreterOutput = new Interpreter(action.ast).interpret();

        return Object.assign({}, state, {
          grammar: Parser.grammar,
          interpreterOutput: interpreterOutput,
          symbolTable: semanticAnalyzer.currentScope.symbols,
        });
      } catch (e) {
        if (e instanceof UnexpectedToken) {
          return Object.assign({}, state, {
            interpreterOutput: "Parser Error: " + e.message,
          });
        }
        if (e instanceof InterpreterError) {
          return Object.assign({}, state, {
            interpreterOutput: "Interpreter Error: " + e.message,
          });
        }
        if (e instanceof SemanticError) {
          return Object.assign({}, state, {
            interpreterOutput: "Name Error: " + e.message,
          });
        }
        return Object.assign({}, state, {
          interpreterOutput: "Unexpected Error: " + e.message,
        });
      }
    default:
      return state;
  }
};

export { code, interpreterView };
