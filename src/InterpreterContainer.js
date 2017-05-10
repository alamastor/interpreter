/* @flow */
import { connect } from "react-redux";
import InterpreterView from "./InterpreterView";
import Interpreter from "./interpreter/Interpreter";
import Lexer from "./interpreter/Lexer";
import Parser from "./interpreter/Parser";
import TokenMiddleware from "./TokenMiddleware";
import ASTMiddleware from "./ASTMiddleware";
import type { MapDispatchToProps } from "react-redux";
import type { Action } from "./actionTypes";
import type { Token } from "./interpreter/Token";
import type { Program } from "./interpreter/Parser";
import { UnexpectedChar } from "./interpreter/Lexer";
import ASTStatifier from "./ASTStratifier";
import * as Immutable from "immutable";

type StateProps = {|
  code: string,
  grammar: Array<string>,
  strata: typeof ASTStatifier,
  interpreterOutput: string,
  tokenList: Array<Token>,
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  tokensMinimized: boolean,
  astMinimized: boolean,
|};

const mapStateToProps = (state, ownProps): StateProps => {
  const codeState = state.code;
  let tokenList = [];
  const parser = new Parser(
    new TokenMiddleware(
      new Lexer(codeState.code),
      () => {
        tokenList = [];
      },
      token => {
        tokenList.push(token);
      },
    ),
  );
  let programAST: Program;
  const interpreterOutput = new Interpreter(
    new ASTMiddleware(parser, ast => {
      programAST = ast;
    }),
  ).interpret();

  const strata = new ASTStatifier(programAST).build();

  return {
    code: codeState,
    grammar: parser.grammar,
    strata: strata,
    interpreterOutput: interpreterOutput,
    tokenList: tokenList,
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
});

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(
  InterpreterView,
);

export type InterpreterProps = StateProps & DispatchProps;

export default AppContainer;
