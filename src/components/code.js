/* @flow */
import React, { Component, Element } from "react";

type CodeProps = {
  children?: Element<any>,
  highlightStart: number,
  highlightStop: number,
  onSetCode: string => void,
};
type CodeState = {
  scrollTop: number,
  scrollLeft: number,
};
export default class extends Component<void, CodeProps, CodeState> {
  onScroll: UIEvent => void;

  state = {
    scrollTop: 0,
    scrollLeft: 0,
  };

  constructor(props: CodeProps) {
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
}
