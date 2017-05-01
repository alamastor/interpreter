/* @flow */
import { connect } from 'react-redux';
import InterpreterView from './InterpreterView';
import Interpreter from './interpreter/Interpreter'
import Lexer from './interpreter/Lexer'
import Parser from './interpreter/Parser'
import TokenMiddleware from './TokenMiddleware'

const onSetCode = (code) => {
  return dispatch => {
    dispatch({
      type: 'code_update',
      code: code,
    })

    const parser = new Parser(new TokenMiddleware(
      new Lexer(code),
      () => dispatch({ type: 'token_list_reset' }),
      token => dispatch({ type: 'token_list_push', token: token })
    ))
    const interpreter = new Interpreter(parser)

    dispatch({
      type: 'parser_grammar_update',
      grammar: parser.grammar
    })

    dispatch({
      type: 'interpreter_output_update',
      output: interpreter.interpret()
    })
  }
}

const mapStateToProps = (state, ownProps) => ({
  code: state.code,
  grammar: state.parser.grammar,
  interpreterOutput: state.interpreter.output,
  tokenList: state.tokenList,
  interpreterVer: parseInt(ownProps.match.params.id, 10),
})

const mapDispatchToProps = dispatch => ({
  onSetCode: (code, interpreterVer) => (dispatch(onSetCode(code, interpreterVer))),
  onSetInterpreterVer: ver => (dispatch({
    type: 'interpreter_ver_update',
    ver: ver
  })),
  onResetTokens: () => (dispatch({
    type: 'token_list_reset'
  })),
  onPushToken: token => (dispatch({
    type: 'token_list_push',
    token: token
  }))
})

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InterpreterView)

export default AppContainer;