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
  interpreterVer: parseInt(ownProps.match.params.id, 10),
});

type DispatchProps = {|
  onSetCode: (string, number) => () => void,
  onSetInterpreterVer: number => () => void,
  onResetTokens: () => () => void,
  onPushToken: Token => () => void,
|};

const mapDispatchToProps: MapDispatchToProps<
  Action,
  Object,
  DispatchProps,
> = dispatch => ({
  onSetCode: (code, interpreterVer) =>
    dispatch(onSetCode(code, interpreterVer)),
  onSetInterpreterVer: ver =>
    dispatch({
      type: "interpreter_ver_update",
      ver: ver,
    }),
  onResetTokens: () =>
    dispatch({
      type: "token_list_reset",
    }),
  onPushToken: token =>
    dispatch({
      type: "token_list_push",
      token: token,
    }),
});

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(
  InterpreterView,
);

export default AppContainer;
