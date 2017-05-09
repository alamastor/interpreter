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
import { UnexpectedChar } from "./interpreter/Lexer";

const onSetCode = code => {
  return dispatch => {
    dispatch({
      type: "code_update",
      code: code,
    });

    const parser = new Parser(
      new TokenMiddleware(
        new Lexer(code),
        () => dispatch({ type: "token_list_reset" }),
        token => dispatch({ type: "token_list_push", token: token }),
      ),
    );

    dispatch({
      type: "parser_grammar_update",
      grammar: parser.grammar,
    });

    const interpreterOutput = new Interpreter(
      new ASTMiddleware(parser, ast =>
        dispatch({ type: "parser_ast_update", ast: ast }),
      ),
    ).interpret();
    dispatch({
      type: "interpreter_output_update",
      output: interpreterOutput,
    });
  };
};

const mapStateToProps = (state, ownProps) => ({
  code: state.code,
  grammar: state.parser.grammar,
  strata: state.astVis.strata,
  interpreterOutput: state.interpreter.output,
  tokenList: state.tokenList,
  grammarMinimized: state.interpreterView.grammarMinimized,
  tokensMinimized: state.interpreterView.tokensMinimized,
  astMinimized: state.interpreterView.astMinimized,
});

type DispatchProps = {|
  onSetCode: (string, number) => () => void,
  onResetTokens: () => () => void,
  onPushToken: Token => () => void,
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
  Object,
  DispatchProps,
> = dispatch => ({
  onSetCode: (code, interpreterVer) =>
    dispatch(onSetCode(code, interpreterVer)),
  onResetTokens: () =>
    dispatch({
      type: "token_list_reset",
    }),
  onPushToken: token =>
    dispatch({
      type: "token_list_push",
      token: token,
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

export default AppContainer;
