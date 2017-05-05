/* @flow */
import React, { Component, Element } from "react";
import "./Interpreter.css";
import AST from "./ASTView";
import type { Token } from "./interpreter/Token";
import { UnexpectedChar } from "./interpreter/Lexer";

class InterpreterView extends Component {
  onSetCode: Function;

  constructor(props: any) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  componentWillMount() {
    this.props.onSetCode("");
  }

  onSetCode(event: any) {
    this.props.onSetCode(event.target.value);
  }

  render() {
    return (
      <main>
        <h1>Pascal Interpreter</h1>
        <Code
          onSetCode={this.onSetCode}
          highlightStart={this.props.code.highlightStart}
          highlightStop={this.props.code.highlightStop}
        >
          {this.props.code.code}
        </Code>
        <h4 className="grammar--header">Grammar:</h4>
        {this.props.grammar.map((s, i) => (
          <p key={i} className="grammar--line">{s}</p>
        ))}
        <h4 className="lexer--header">Token Stream:</h4>
        {this.props.tokenList.map((tokenOrError, i) => (
          <TokenView
            tokenOrError={tokenOrError}
            onHoverToken={this.props.onHoverToken}
            onStopHoverToken={this.props.onStopHoverToken}
            key={i}
          />
        ))}
        <h4 className="ast-header">AST:</h4>
        <div className="ast-container">
          <AST
            strata={this.props.strata}
            onHoverNode={this.props.onHoverNode}
            onStopHoverNode={this.props.onStopHoverNode}
          />
        </div>
        <h4 className="interpreter--header">Interpreter Output:</h4>
        <p className="interpreter--line">{this.props.interpreterOutput}</p>
      </main>
    );
  }
}

const TokenView = (props: {
  tokenOrError: Token | UnexpectedChar,
  onHoverToken: (Token | UnexpectedChar) => void,
  onStopHoverToken: () => void,
}) => {
  const tokenOrError = props.tokenOrError;
  let result;
  if (tokenOrError instanceof UnexpectedChar) {
    const error = tokenOrError;
    result = error.message;
  } else {
    const token = tokenOrError;
    result = token.type;
    if (token.hasOwnProperty("value")) {
      result += ": " + token.value;
    }
  }
  const onMouseEnter = () => props.onHoverToken(tokenOrError);
  return (
    <p
      className="lexer--line"
      onMouseEnter={onMouseEnter}
      onMouseLeave={props.onStopHoverToken}
    >
      {result}
    </p>
  );
};

type HighlightViewProps = {
  children?: Element<any>,
  highlightStart: number,
  highlightStop: number,
  onSetCode: string => void,
};

const Code = (props: HighlightViewProps): Element<any> => {
  let code;
  typeof props.children === "string" ? (code = props.children) : (code = "");

  const highlightText = code + " "; // One space on end to allow highligh EOF.
  const beforeHightlight = highlightText.slice(0, props.highlightStart);
  const highlight = highlightText.slice(
    props.highlightStart,
    props.highlightStop,
  );
  const afterHighlight = highlightText.slice(props.highlightStop);
  return (
    <div className="code">
      <textarea
        className="code-text"
        spellCheck="false"
        value={code}
        onChange={props.onSetCode}
      />

      <div className="highlights-container">
        <div className="highlights">
          {beforeHightlight}<mark>{highlight}</mark>{afterHighlight}
        </div>
      </div>
    </div>
  );
};

export default InterpreterView;
