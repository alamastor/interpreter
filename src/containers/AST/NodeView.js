/* @flow */
import type { ViewNode } from "./tree";
import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";
import { NODE_RAD, DURATION } from "./consts";
import type { Node } from "./Stratifier";
import type { Action } from "../../actionTypes";
import { Transition } from "react-transition-group";
import "./index.css";

type NodeViewProps = {
  node: ViewNode,
  id: string,
  onHoverNode: Node => Action,
  onStopHoverNode: () => Action,
  onClickNode: Node => Action,
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
      const eleTransition = ele
        .transition()
        .duration(DURATION)
        .attr("transform", "translate(" + x + "," + y + ")")
        .on("end", () => {
          this.setState({ x, y });
          callback();
        });
      eleTransition.select("g > text").style("fill-opacity", 1);
      eleTransition
        .select("g > circle")
        .style("fill-opacity", 1)
        .style("stroke-opacity", 1);
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
    const eleTransition = d3
      .select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(DURATION)
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
    eleTransition.select("g > text").style("fill-opacity", 1e-6);
    eleTransition
      .select("g > circle")
      .style("fill-opacity", 1e-6)
      .style("stroke-opacity", 1e-6);
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
        <Transition
          timeout={DURATION}
          onEntering={this.componentWillEnter}
          {...this.props}
        >
          <g
            transform={"translate(" + this.state.x + "," + this.state.y + ")"}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          >
            <circle
              className="node--circle"
              stroke="steelblue"
              r={NODE_RAD}
              fill={color}
              onClick={this.onClick}
              fillOpacity="1e-6"
              strokeOpacity="1e-6"
            />
            <text
              className="node--text"
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="10"
              dx="-10"
              fillOpacity="1e-6"
            >
              {this.props.node.data.name}
            </text>
          </g>
        </Transition>
      );
    }
    return null;
  }
}
