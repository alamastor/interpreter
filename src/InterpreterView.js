import React, { Component } from 'react';
import InterpreterV1 from './interpreters/InterpreterV1';
import InterpreterV2 from './interpreters/InterpreterV2';
import InterpreterV3 from './interpreters/InterpreterV3';
import InterpreterV4 from './interpreters/interpreterV4/Interpreter';
import LexerV4 from './interpreters/interpreterV4/Lexer';
import Interpreter from './interpreters/interpreter/Interpreter';
import Lexer from './interpreters/interpreter/Lexer';
import './Interpreter.css'

class InterpreterView extends Component {
  onSetCode: Function;

  constructor(props: any) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  onSetCode(event: any) {
    this.props.onSetCode(event.target.value);
  }

  render() {
    let interpreterVer = this.props.interpreterVer || 4
    let interpreter;
    switch (interpreterVer) {
      case 1:
        interpreter = new InterpreterV1(this.props.code)
        break
      case 2:
        interpreter = new InterpreterV2(this.props.code)
        break
      case 3:
        interpreter = new InterpreterV3(this.props.code)
        break
      case 4:
        interpreter = new InterpreterV4(new LexerV4(this.props.code))
        break
      case 5:
        interpreter = new Interpreter(new Lexer(this.props.code))
        break
      default:
        interpreter = new Interpreter(new Lexer(this.props.code))
    }
    return (
      <main>
        <h1>Pascal Interpreter V{ interpreterVer }</h1>
        <h4 className='grammer--header'>Grammer:</h4>
        {interpreter.grammer.map((s, i) => (
          <p key={i} className="grammer--line">{s}</p>
        ))}
        <textarea
          className="code"
          spellCheck="false"
          value={ this.props.code }
          onChange={ this.onSetCode }
          rows="20"
        />
        <p>Result: { interpreter.interpret() }</p>
      </main>
    )
  }
}


export default InterpreterView