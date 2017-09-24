/* @flow */
import React, { Component } from "react";
import "./index.css";
import ASTContainer from "../AST";
import type { ASTSymbol } from "../../interpreter/ASTSymbol";
import { toASTSymbol } from "../../interpreter/ASTSymbol";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import type { State } from "../../store";
import LexerContainer from "../Lexer";
import Parser, { UnexpectedToken } from "../../interpreter/Parser";
import type { Program } from "../../interpreter/Parser";
import Code from "../../components/code";
import type { Action } from "../../actionTypes";
import {
  onSetCode,
  onClickGrammarToggle,
  onClickASTToggle,
  onClickSymbolTableToggle,
  onReceiveAST,
} from "./actions";

const mapStateToProps = (state: State) => ({
  code: state.interpreterPage.code,
  ast: state.ast.ast,
  interpreterOutput: state.interpreterPage.interpreterOutput,
  symbolTable: state.interpreterPage.symbolTable,
  highlightStart: state.interpreterPage.highlightStart,
  highlightStop: state.interpreterPage.highlightStop,
  grammarMinimized: state.interpreterPage.grammarMinimized,
  symbolTableMinimized: state.interpreterPage.symbolTableMinimized,
  astMinimized: state.interpreterPage.astMinimized,
  tokenList: state.lexer.tokenList,
});

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      onSetCode,
      onClickGrammarToggle,
      onClickASTToggle,
      onClickSymbolTableToggle,
      onReceiveAST,
    },
    dispatch,
  );

type InterpreterProps = {
  code: string,
  interpreterOutput: string,
  ast: ?Program | UnexpectedToken,
  symbolTable: { [string]: ASTSymbol },
  highlightStart: number,
  highlightStop: number,
  grammarMinimized: boolean,
  symbolTableMinimized: boolean,
  astMinimized: boolean,
  highlightStart: number,
  highlightStop: number,
  onSetCode: string => Action,
  onClickGrammarToggle: () => Action,
  onClickASTToggle: () => Action,
  onClickSymbolTableToggle: () => Action,
  onReceiveAST: (?Program | UnexpectedToken) => Action,
};

class InterpreterView extends Component<void, InterpreterProps, void> {
  onSetCode: string => void;

  constructor(props: InterpreterProps) {
    super(props);

    this.onSetCode = this.onSetCode.bind(this);
  }

  componentWillReceiveProps(nextProps: InterpreterProps) {
    if (nextProps.ast !== this.props.ast) {
      this.props.onReceiveAST(nextProps.ast);
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
          {Parser.grammar.map((s, i) => (
            <p key={i} className="grammar--line">
              {s}
            </p>
          ))}
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
        <p className="interpreter--line">{this.props.interpreterOutput}</p>
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
  return <ul>{children}</ul>;
};

export default connect(mapStateToProps, mapDispatchToProps)(InterpreterView);
