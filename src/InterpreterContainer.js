/* @flow */
import { connect } from 'react-redux';
import InterpreterView from './InterpreterView';
import InterpreterV1 from './interpreters/InterpreterV1'
import InterpreterV2 from './interpreters/InterpreterV2'
import InterpreterV3 from './interpreters/InterpreterV3'
import InterpreterV4 from './interpreters/interpreterV4/Interpreter'
import LexerV4 from './interpreters/interpreterV4/Lexer'
import InterpreterV5 from './interpreters/interpreterV5/Interpreter'
import LexerV5 from './interpreters/interpreterV5/Lexer'
import InterpreterV6 from './interpreters/interpreterV6/Interpreter'
import LexerV6 from './interpreters/interpreterV6/Lexer'
import Interpreter from './interpreters/interpreter/Interpreter'
import Lexer from './interpreters/interpreter/Lexer'
import Parser from './interpreters/interpreter/Parser'
import TokenMiddleware from './TokenMiddleware'

const onSetCode = (code, interpreterVer) => {
  return dispatch => {
    dispatch({
      type: 'code_update',
      code: code,
    })

    let interpreter;
    let parser;
    switch (interpreterVer) {
      case 1:
        interpreter = new InterpreterV1(code)
        break
      case 2:
        interpreter = new InterpreterV2(code)
        break
      case 3:
        interpreter = new InterpreterV3(code)
        break
      case 4:
        interpreter = new InterpreterV4(new TokenMiddleware(
          new LexerV4(code),
          () => dispatch({ type: 'token_list_reset' }),
          token => dispatch({ type: 'token_list_push', token: token })
        ))
        break
      case 5:
        interpreter = new InterpreterV5(new TokenMiddleware(
          new LexerV5(code),
          () => dispatch({ type: 'token_list_reset' }),
          token => dispatch({ type: 'token_list_push', token: token })
        ))
        break
      case 6:
        interpreter = new Interpreter(new TokenMiddleware(
          new Lexer(code),
          () => dispatch({ type: 'token_list_reset' }),
          token => dispatch({ type: 'token_list_push', token: token })
        ))
        break
      case 7:
        parser = new Parser(new TokenMiddleware(
          new Lexer(code),
          () => dispatch({ type: 'token_list_reset' }),
          token => dispatch({ type: 'token_list_push', token: token })
        ))
        interpreter = new Interpreter(parser)
        break
      default:
        parser = new Parser(new TokenMiddleware(
          new Lexer(code),
          () => dispatch({ type: 'token_list_reset' }),
          token => dispatch({ type: 'token_list_push', token: token })
        ))
        interpreter = new Interpreter(parser)
    }

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