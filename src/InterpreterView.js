import React, { Component } from 'react'
import './Interpreter.css'

class InterpreterView extends Component {
  onSetCode: Function;

  constructor(props: any) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  componentWillMount() {
    this.props.onSetCode('')
  }

  onSetCode(event: any) {
    this.props.onSetCode(event.target.value)
  }

  render() {
    return (
      <main>
        <h1>Pascal Interpreter</h1>
        <textarea
          className="code"
          spellCheck="false"
          value={ this.props.code }
          onChange={ this.onSetCode }
          rows="20"
        />
        <h4 className="grammar--header">Grammar:</h4>
        {this.props.grammar.map((s, i) => (
          <p key={i} className="grammar--line">{s}</p>
        ))}
        <h4 className="lexer--header">Lexer Stream:</h4>
        {this.props.tokenList.map((tokenOrError, i) => {
          let result
          if (tokenOrError instanceof Error) {
            const error = tokenOrError
            result = error.message
          } else {
            const token = tokenOrError
            result = token.type
            if (token.hasOwnProperty('value')) {
              result += ': ' + token.value
            }
          }
          return (<p key={i} className="lexer--line">{result}</p>)
        })}
        <h4 className="interpreter--header">Interpreter Output:</h4>
        <p className="interpreter--line">{ this.props.interpreterOutput }</p>
      </main>
    )
  }
}


export default InterpreterView