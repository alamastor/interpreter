/* @flow */
import React, { Component, Element } from "react";
import "./index.css";
import ASTContainer from "../AST";
import type { Token } from "../../interpreter/Token";
import type { ASTSymbol } from "../../interpreter/ASTSymbol";
import { toASTSymbol } from "../../interpreter/ASTSymbol";
import { connect } from "react-redux";
import type { State } from "../../store";
import type { Dispatch } from "../../store";
import LexerContainer from "../Lexer";

const mapStateToProps = (state: State) => ({
  code: state.code.code,
  grammar: state.code.grammar,
  interpreterOutput: state.code.interpreterOutput,
  symbolTable: state.code.symbolTable,
  highlightStart: state.interpreterView.highlightStart,
  highlightStop: state.interpreterView.highlightStop,
  grammarMinimized: state.interpreterView.grammarMinimized,
  symbolTableMinimized: state.interpreterView.symbolTableMinimized,
  astMinimized: state.interpreterView.astMinimized,
  tokenList: state.lexer.tokenList,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSetCode: code =>
    dispatch({
      type: "code_update",
      code: code,
    }),
  onClickGrammarToggle: () =>
    dispatch({
      type: "interpreter_view_grammar_toggle_click",
    }),
  onClickASTToggle: () =>
    dispatch({
      type: "interpreter_view_ast_toggle_click",
    }),
  onClickSymbolTableToggle: () =>
    dispatch({
      type: "interpreter_view_symbol_table_toggle_click",
    }),
  updateTokenList: (tokenList: Array<Token>) =>
    dispatch({
      type: "interpreter_update_token_list",
      tokenList: tokenList,
    }),
});

type InterpreterProps = {|
  code: string,
  grammar: Array<string>,
  interpreterOutput: string,
  tokenList: Array<Token>,
  symbolTable: { [string]: ASTSymbol },
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  symbolTableMinimized: boolean,
  astMinimized: boolean,
  grammar: Array<string>,
  highlightStart: number,
  highlightStop: number,
  onSetCode: string => void,
  onClickGrammarToggle: () => void,
  onClickASTToggle: () => void,
  onClickSymbolTableToggle: () => void,
  updateTokenList: (Array<Token>) => void,
|};

class InterpreterView extends Component<void, InterpreterProps, void> {
  onSetCode: string => void;

  constructor(props: InterpreterProps) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  componentWillReceiveProps(nextProps: InterpreterProps) {
    if (nextProps.tokenList !== this.props.tokenList) {
      this.props.updateTokenList(nextProps.tokenList);
    }
  }

  componentWillMount() {
    this.props.onSetCode(this.props.code);
  }

  onSetCode({ target }: { target: EventTarget }) {
    if (target.value != null && typeof target.value === "string") {
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
          {this.props.code}
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
          {this.props.grammar.map((s, i) =>
            <p key={i} className="grammar--line">
              {s}
            </p>,
          )}
        </ul>
        <LexerContainer />
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
          <ASTContainer />
        </div>
        <h4>
          Symbol Table
          <button
            className="toggle-button"
            onClick={this.props.onClickSymbolTableToggle}
          >
            {this.props.symbolTableMinimized ? "+" : "-"}
          </button>
          <div
            style={{
              display: this.props.symbolTableMinimized ? "none" : "block",
            }}
          >
            <SymbolTableView symbolTable={this.props.symbolTable} />
          </div>
        </h4>
        <h4 className="interpreter--header">Interpreter Output:</h4>
        <p className="interpreter--line">
          {this.props.interpreterOutput}
        </p>
      </main>
    );
  }
}

const SymbolTableView = (props: { symbolTable: { [string]: ASTSymbol } }) => {
  const children = [];
  Object.values(props.symbolTable).forEach((x, i) => {
    const s = toASTSymbol(x);
    if (s) {
      if (s.symbolType === "builtin_type") {
        children.push(
          <li className="symbol-table--line" key={i}>
            {s.name}
          </li>,
        );
      } else if (s.symbolType === "procedure") {
        children.push(
          <li className="symbol-table--line" key={i}>
            {s.name}
          </li>,
        );
      } else {
        children.push(
          <li className="symbol-table--line" key={i}>
            {s.name + ": " + s.type.name}
          </li>,
        );
      }
    }
  });
  return (
    <ul>
      {children}
    </ul>
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
            {beforeHightlight}
            <mark>
              {highlight}
            </mark>
            {afterHighlight}
          </div>
        </div>
      </div>
    );
  }
};

const InterpreterViewContainer = connect(mapStateToProps, mapDispatchToProps)(
  InterpreterView,
);

export default InterpreterViewContainer;
