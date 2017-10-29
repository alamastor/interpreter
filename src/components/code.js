/* @flow */
import React, { Component, Element } from "react";
import type { Action } from "../actionTypes";

type CodeProps = {
  children?: Element<any>,
  highlightStart: number,
  highlightStop: number,
  onSetCode: string => Action,
};
type CodeState = {
  scrollTop: number,
  scrollLeft: number,
};
export default class extends Component<void, CodeProps, CodeState> {
  onScroll: UIEvent => void;
  onTab: KeyboardEvent => void;
  onKeyDown: KeyboardEvent => void;
  onUpdateText: KeyboardEvent => void;

  state = {
    scrollTop: 0,
    scrollLeft: 0,
  };

  constructor(props: CodeProps) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTab = this.onTab.bind(this);
    this.onUpdateText = this.onUpdateText.bind(this);
    this.state = {
      scrollTop: 0,
      scrollLeft: 0,
    };
  }

  onUpdateText({ target }: { target: EventTarget }) {
    if (target.value != null && typeof target.value === "string") {
      this.props.onSetCode(target.value);
    }
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

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 9) {
      this.onTab(event);
    }
  }

  onTab(event: KeyboardEvent) {
    // TODO: Currently just inserts 4 spaces, add real tab behaviour.
    event.preventDefault();
    const target = event.target;
    if (target instanceof window.HTMLTextAreaElement) {
      const cursorPosition = target.selectionStart;
      const code = target.value;
      const updateText =
        code.slice(0, cursorPosition) + "    " + code.slice(cursorPosition);
      this.refs.textArea.value = updateText;
      this.refs.textArea.selectionEnd = cursorPosition + 4;
      this.props.onSetCode(updateText);
    }
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
          onChange={this.onUpdateText}
          onScroll={this.onScroll}
          onKeyDown={this.onKeyDown}
          ref="textArea"
        />

        <div className="highlights-container" ref="highlightsContainer">
          <div className="highlights">
            {beforeHightlight}
            <mark>{highlight}</mark>
            {afterHighlight}
          </div>
        </div>
      </div>
    );
  }
}
