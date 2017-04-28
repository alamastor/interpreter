import React, { Component } from 'react';
import Interpreter from './interpreters/Interpreter';
import InterpreterV1 from './interpreters/InterpreterV1';


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
    let interpreter;
    let interpreterVer;
    console.log(this.props.interpreter)
    switch (this.props.interpreter) {
      case 1:
        interpreter = new InterpreterV1(this.props.code)
        interpreterVer = 1
        break
      case 2:
        interpreter = new Interpreter(this.props.code)
        interpreterVer = 2
        break
      default:
        interpreter = new Interpreter(this.props.code)
        interpreterVer = 2
    }
    return (
      <div className="App">
        <div className="container">
          <h1>Pascal Interpreter V{ interpreterVer }</h1>
          <textarea
            className="code"
            spellCheck="false"
            value={ this.props.code }
            onChange={ this.onSetCode }
            rows="25"
          />
        </div>
        <p>Result: { interpreter.interpret() }</p>
      </div>
    );
  }
}

export default InterpreterView