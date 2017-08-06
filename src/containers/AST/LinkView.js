/* @flow */
import React, { Component } from "react";
import ReactDOM from "react-dom";
import type { Node } from "../../ASTStratifier";
import type { ViewNode } from "./tree";
import * as d3 from "d3";
import {
  getNodeParentX,
  getNodeParentY,
  getNodeX,
  getNodeY,
  mapTreeToNewCoords,
  treeMaxX,
  treeMaxY,
  viewNodeKey,
} from "./tree";
import { DURATION, NODE_RAD } from "./consts";

type LinkProps = {
  node: ViewNode,
  sourceNode: ViewNode,
  previousSourceNode: ViewNode,
  nextSourceNode: ViewNode,
};

type LinkState = {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
};

export default class extends Component<void, LinkProps, LinkState> {
  state = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  constructor(props: {
    node: ViewNode,
    sourceNode: ViewNode,
    previousSourceNode: ViewNode,
    nextSourceNode: ViewNode,
  }) {
    super(props);

    if (
      typeof this.props.previousSourceNode.x === "number" &&
      typeof this.props.previousSourceNode.y === "number"
    ) {
      this.state = {
        startX: this.props.previousSourceNode.x,
        startY: this.props.previousSourceNode.y,
        endX: this.props.previousSourceNode.x,
        endY: this.props.previousSourceNode.y,
      };
    } else {
      this.state = {
        startX: this.props.node.x || 0,
        startY: this.props.node.y || 0,
        endX: this.props.node.x || 0,
        endY: this.props.node.y || 0,
      };
    }
  }

  componentWillAppear(callback: () => void) {
    let ele = d3.select(ReactDOM.findDOMNode(this));

    // Transition stuff here.
    ele
      .transition(d3.transition().duration(DURATION))
      .attr(
        "d",
        this.pathShape(
          getNodeParentX(this.props.node),
          getNodeParentY(this.props.node),
          getNodeX(this.props.node),
          getNodeY(this.props.node),
        ),
      )
      .on("end", () => {
        this.setState({
          startX: getNodeParentX(this.props.node),
          startY: getNodeParentY(this.props.node),
          endX: getNodeX(this.props.node),
          endY: getNodeY(this.props.node),
        });
        callback();
      });
  }

  componentWillReceiveProps(nextProps: LinkProps) {
    let ele = d3.select(ReactDOM.findDOMNode(this));
    ele
      .transition(d3.transition().duration(DURATION))
      .attr(
        "d",
        this.pathShape(
          getNodeParentX(nextProps.node),
          getNodeParentY(nextProps.node),
          getNodeX(nextProps.node),
          getNodeY(nextProps.node),
        ),
      );
  }

  componentWillEnter(callback: () => void) {
    this.componentWillAppear(callback);
  }

  componentWillLeave(callback: () => void) {
    let ele = d3.select(ReactDOM.findDOMNode(this));
    ele
      .transition(d3.transition().duration(DURATION))
      .attr(
        "d",
        this.pathShape(
          this.props.nextSourceNode.x || 0,
          this.props.nextSourceNode.y || 0,
          this.props.nextSourceNode.x || 0,
          this.props.nextSourceNode.y || 0,
        ),
      )
      .on("end", () => {
        this.setState({
          startX: this.props.nextSourceNode.x || 0,
          startY: this.props.nextSourceNode.y || 0,
          endX: this.props.nextSourceNode.x || 0,
          endY: this.props.nextSourceNode.y || 0,
        });
        callback();
      });
  }

  pathShape(startX: number, startY: number, endX: number, endY: number) {
    const [pathStartX, pathStartY] = [startX + NODE_RAD, startY];
    const [pathEndX, pathEndY] = [endX - NODE_RAD, endY];
    const thirdX = (endX - startX) / 3;
    return (
      "M " +
      pathStartX +
      "," +
      pathStartY +
      "C " +
      (pathStartX + thirdX) +
      "," +
      pathStartY +
      " " +
      (pathEndX - thirdX) +
      "," +
      pathEndY +
      " " +
      pathEndX +
      "," +
      pathEndY
    );
  }

  render() {
    return (
      <path
        d={this.pathShape(
          this.state.startX,
          this.state.startY,
          this.state.endX,
          this.state.endY,
        )}
        stroke="darkgrey"
        fill="none"
      />
    );
  }
}
