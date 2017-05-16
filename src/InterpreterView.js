/* @flow */
import React, { Component, Element } from "react";
import "./Interpreter.css";
import AST from "./ASTView";
import type { Token } from "./interpreter/Token";
import { UnexpectedChar } from "./interpreter/Lexer";
import type { InterpreterProps } from "./InterpreterContainer";

class InterpreterView extends Component {
  onSetCode: string => void;

  constructor(props: InterpreterProps) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  onSetCode({ target }: { target: EventTarget }) {
    if (target.value) {
      this.props.onSetCode(target.value);
    }
  }

  render() {
    return (
      <main>
        <h1>Pascal Interpreter</h1>
        <Code
          onSetCode={this.onSetCode}
          highlightStart={this.props.highlightStart}
          highlightStop={this.props.highlightStop}
        >
          {this.props.code.code}
        </Code>
        <h4 className="grammar--header">
          Grammar
          <button
            className="toggle-button"
            onClick={this.props.onClickGrammarToggle}
          >
            {this.props.grammarMinimized ? "+" : "-"}
          </button>
        </h4>
        <ul
          className="grammar--list"
          style={{ display: this.props.grammarMinimized ? "none" : "block" }}
        >
          {this.props.grammar.map((s, i) => (
            <p key={i} className="grammar--line">{s}</p>
          ))}
        </ul>
        <h4 className="lexer--header">
          Token Stream
          <button
            className="toggle-button"
            onClick={this.props.onClickTokensToggle}
          >
            {this.props.tokensMinimized ? "+" : "-"}
          </button>
        </h4>
        <ul
          className="lexer--list"
          style={{ display: this.props.tokensMinimized ? "none" : "block" }}
        >
          {this.props.tokenList.map((tokenOrError, i) => (
            <TokenView
              tokenOrError={tokenOrError}
              onHoverToken={this.props.onHoverToken}
              onStopHoverToken={this.props.onStopHoverToken}
              key={i}
            />
          ))}
        </ul>
        <h4 className="ast-header">
          AST
          <button
            className="toggle-button"
            onClick={this.props.onClickASTToggle}
          >
            {this.props.astMinimized ? "+" : "-"}
          </button>
        </h4>
        <div
          className="ast-container"
          style={{ display: this.props.astMinimized ? "none" : "block" }}
        >
          <AST
            strata={this.props.strata}
            hiddenNodes={this.props.astHiddenNodes}
            onHoverNode={this.props.onHoverNode}
            onStopHoverNode={this.props.onStopHoverNode}
            onClickNode={this.props.onClickASTNode}
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
    if (token.value) {
      if (typeof token.value === "number") {
        result += ": " + token.value.toString(10);
      } else if (typeof token.value === "string") {
        result += ": " + token.value;
      }
    }
  }
  const onMouseEnter = () => props.onHoverToken(tokenOrError);
  return (
    <li
      className="lexer--line"
      onMouseEnter={onMouseEnter}
      onMouseLeave={props.onStopHoverToken}
    >
      {result}
    </li>
  );
};

type HighlightViewProps = {
  children?: Element<any>,
  highlightStart: number,
  highlightStop: number,
  onSetCode: string => void,
};

const Code = class extends Component {
  props: HighlightViewProps;
  onScroll: UIEvent => void;
  state: {
    scrollTop: number,
    scrollLeft: number,
  };

  constructor(props: HighlightViewProps) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.state = {
      scrollTop: 0,
      scrollLeft: 0,
    };
  }

  componentDidUpdate() {
    this.refs.highlightsContainer.scrollTop = this.state.scrollTop;
    this.refs.highlightsContainer.scrollLeft = this.state.scrollLeft;
  }

  onScroll(event: UIEvent) {
    this.setState({
      scrollTop: this.refs.textArea.scrollTop,
      scrollLeft: this.refs.textArea.scrollLeft,
    });
  }

  render() {
    let code;
    typeof this.props.children === "string"
      ? (code = this.props.children)
      : (code = "");

    const highlightText = code + " "; // One space on end to allow highligh EOF.
    const beforeHightlight = highlightText.slice(0, this.props.highlightStart);
    const highlight = highlightText.slice(
      this.props.highlightStart,
      this.props.highlightStop,
    );
    const afterHighlight = highlightText.slice(this.props.highlightStop);

    return (
      <div className="code">
        <textarea
          className="code-text"
          spellCheck="false"
          value={code}
          onChange={this.props.onSetCode}
          onScroll={this.onScroll}
          ref="textArea"
        />

        <div className="highlights-container" ref="highlightsContainer">
          <div className="highlights">
            {beforeHightlight}<mark>{highlight}</mark>{afterHighlight}
          </div>
        </div>
      </div>
    );
  }
};

export default InterpreterView;
