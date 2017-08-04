/* @flow */
import { connect } from "react-redux";
import InterpreterView from "./InterpreterView";
import type { Token } from "./interpreter/Token";
import { UnexpectedChar } from "./interpreter/Lexer";
import type { ASTSymbol } from "./interpreter/ASTSymbol";
import type { State } from "./store";

type StateProps = {|
  code: string,
  grammar: Array<string>,
  interpreterOutput: string,
  tokenList: Array<Token | UnexpectedChar>,
  symbolTable: { [string]: ASTSymbol },
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  tokensMinimized: boolean,
  symbolTableMinimized: boolean,
  astMinimized: boolean,
|};

const mapStateToProps = (state: State): StateProps => ({
  code: state.code.code,
  grammar: state.code.grammar,
  interpreterOutput: state.code.interpreterOutput,
  tokenList: state.code.tokenList,
  symbolTable: state.code.symbolTable,
  highlightStart: state.interpreterView.highlightStart,
  highlightStop: state.interpreterView.highlightStop,
  grammarMinimized: state.interpreterView.grammarMinimized,
  tokensMinimized: state.interpreterView.tokensMinimized,
  symbolTableMinimized: state.interpreterView.symbolTableMinimized,
  astMinimized: state.interpreterView.astMinimized,
});

type DispatchProps = {|
  onSetCode: (code: string) => void,
  onHoverToken: (tokenOrError: Token | UnexpectedChar) => void,
  onStopHoverToken: () => void,
  onClickGrammarToggle: () => void,
  onClickTokensToggle: () => void,
  onClickASTToggle: () => void,
  onClickSymbolTableToggle: () => void,
|};

const mapDispatchToProps = (dispatch: *) => ({
  onSetCode: code =>
    dispatch({
      type: "code_update",
      code: code,
    }),
  onHoverToken: tokenOrError =>
    dispatch({
      type: "token_hover",
      tokenOrError: tokenOrError,
    }),
  onStopHoverToken: () =>
    dispatch({
      type: "token_hover_stop",
    }),
  onClickGrammarToggle: () =>
    dispatch({
      type: "interpreter_view_grammar_toggle_click",
    }),
  onClickTokensToggle: () =>
    dispatch({
      type: "interpreter_view_tokens_toggle_click",
    }),
  onClickASTToggle: () =>
    dispatch({
      type: "interpreter_view_ast_toggle_click",
    }),
  onClickSymbolTableToggle: () =>
    dispatch({
      type: "interpreter_view_symbol_table_toggle_click",
    }),
});

const InterpreterViewContainer = connect(mapStateToProps, mapDispatchToProps)(
  InterpreterView,
);

export type InterpreterProps = StateProps & DispatchProps;

export default InterpreterViewContainer;
