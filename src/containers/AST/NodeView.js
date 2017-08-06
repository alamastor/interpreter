/* @flow */
import type { ViewNode } from "./tree";
import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";
import { NODE_RAD, DURATION } from "./consts";
import type { Node } from "./Stratifier";

type NodeViewProps = {
  node: ViewNode,
  id: string,
  onHoverNode: Node => void,
  onStopHoverNode: () => void,
  onClickNode: Node => void,
  sourceNode: ViewNode,
  nextSourceNode: ViewNode,
  previousSourceNode: ViewNode,
};

export default class extends Component<
  void,
  NodeViewProps,
  {
    x: number,
    y: number,
  },
> {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  state = {
    x: 0,
    y: 0,
  };

  constructor(props: NodeViewProps) {
    super(props);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
      x: this.props.previousSourceNode.x || 0,
      y: this.props.previousSourceNode.y || 0,
    };
  }

  componentWillAppear(callback: () => void) {
    let ele = d3.select(ReactDOM.findDOMNode(this));

    if (this.props.node.x !== undefined && this.props.node.y !== undefined) {
      const x = this.props.node.x;
      const y = this.props.node.y;
      ele
        .transition(d3.transition().duration(DURATION))
        .attr("transform", "translate(" + x + "," + y + ")")
        .on("end", () => {
          this.setState({ x, y });
          callback();
        });
    }
  }

  componentWillEnter(callback: () => void) {
    this.componentWillAppear(callback);
  }

  componentWillReceiveProps(nextProps: NodeViewProps) {
    let ele = d3.select(ReactDOM.findDOMNode(this));

    if (
      nextProps.node.x !== this.props.node.x ||
      nextProps.node.y !== this.props.node.y
    ) {
      if (nextProps.node.x !== undefined && nextProps.node.y !== undefined) {
        const x = nextProps.node.x;
        const y = nextProps.node.y;
        ele
          .transition(d3.transition().duration(DURATION))
          .attr("transform", "translate(" + x + "," + y + ")")
          .on("end", () => {
            this.setState({ x, y });
          });
      }
    }
  }

  componentWillLeave(callback: () => void) {
    let ele = d3.select(ReactDOM.findDOMNode(this));
    ele
      .transition(d3.transition().duration(DURATION))
      .attr(
        "transform",
        "translate(" +
          (this.props.nextSourceNode.x || 0) +
          "," +
          (this.props.nextSourceNode.y || 0) +
          ")",
      )
      .on("end", () => {
        this.setState({
          x: 0,
          y: 0,
        });
        callback();
      });
  }

  onMouseEnter() {
    this.props.onHoverNode(this.props.node.data);
  }

  onMouseLeave() {
    this.props.onStopHoverNode();
  }

  onClick() {
    this.props.onClickNode(this.props.node.data);
  }

  render() {
    let color;
    if (
      this.props.node.data.hiddenChildren &&
      this.props.node.data.hiddenChildren.length > 0
    ) {
      color = "lightsteelblue";
    } else {
      color = "white";
    }

    if (
      typeof this.props.node.y === "number" &&
      typeof this.props.node.x === "number"
    ) {
      return (
        <g
          transform={"translate(" + this.state.x + "," + this.state.y + ")"}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <circle
            r={NODE_RAD}
            fill={color}
            stroke="steelblue"
            onClick={this.onClick}
          />
          <text
            textAnchor="end"
            alignmentBaseline="middle"
            fontSize="10"
            dx="-10"
          >
            {this.props.node.data.name}
          </text>
        </g>
      );
    }
    return null;
  }
}
