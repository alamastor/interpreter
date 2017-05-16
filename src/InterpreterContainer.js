/* @flow */
import { connect } from "react-redux";
import * as Immutable from "immutable";
import InterpreterView from "./InterpreterView";
import type { MapDispatchToProps } from "react-redux";
import type { Action } from "./actionTypes";
import Node from "./ASTView";
import { UnexpectedChar } from "./interpreter/Lexer";
import type { Token } from "./interpreter/Token";

type StateProps = {|
  code: string,
  grammar: Immutable.List<string>,
  strata: Node,
  interpreterOutput: string,
  tokenList: Array<Token>,
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  tokensMinimized: boolean,
  astMinimized: boolean,
|};

const mapStateToProps = (state, ownProps): StateProps => {
  return {
    code: state.code,
    grammar: state.interpreterView.grammar,
    strata: state.interpreterView.strata,
    interpreterOutput: state.interpreterView.interpreterOutput,
    tokenList: state.interpreterView.tokenList,
    highlightStart: state.interpreterView.highlightStart,
    highlightStop: state.interpreterView.highlightStop,
    grammarMinimized: state.interpreterView.grammarMinimized,
    tokensMinimized: state.interpreterView.tokensMinimized,
    astMinimized: state.interpreterView.astMinimized,
  };
};

type DispatchProps = {|
  onSetCode: string => () => void,
  onHoverToken: (Token | UnexpectedChar) => () => void,
  onStopHoverToken: () => () => void,
  onHoverNode: Node => () => void,
  onStopHoverNode: () => () => void,
  onClickGrammarToggle: () => () => void,
  onClickTokensToggle: () => () => void,
  onClickASTToggle: () => () => void,
  onClickASTNode: Node => () => void,
|};

const mapDispatchToProps: MapDispatchToProps<
  Action,
  *,
  DispatchProps,
> = dispatch => ({
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
  onHoverNode: node =>
    dispatch({
      type: "ast_node_hover",
      node: node,
    }),
  onStopHoverNode: () =>
    dispatch({
      type: "ast_node_hover_stop",
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
  onClickASTNode: node =>
    dispatch({
      type: "interpreter_view_ast_node_click",
      node: node,
    }),
});

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(
  InterpreterView,
);

export type InterpreterProps = StateProps & DispatchProps;

export default AppContainer;
