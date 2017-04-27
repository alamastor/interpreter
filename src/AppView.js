/* @flow */

import React, { Component } from 'react';
import './App.css';
import Interpreter from './Interpreter';


class AppView extends Component {
  onSetCode: Function;

  constructor(props: any) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  onSetCode(event: any) {
    this.props.onSetCode(event.target.value);
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          <textarea
            className="code"
            spellCheck="false"
            value={ this.props.code }
            onChange={ this.onSetCode }
            rows="25"
          />
        </div>
        <p>Result: { new Interpreter(this.props.code).interpret() }</p>
      </div>
    );
  }
}

export default AppView;