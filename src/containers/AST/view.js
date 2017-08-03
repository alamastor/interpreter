/* @flow */
import React, { Component } from "react";
import ReactDOM from "react-dom";
import TransitionGroup from "react-transition-group/TransitionGroup";
import * as d3 from "d3";
import type { Program } from "../../interpreter/parser";
import { Node } from "../../ASTStratifier";
import type { ASTProps } from "./index";
import type { ViewNode } from "./tree";
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

const NODE_RAD = 5;
const DURATION = 1000;

const findNode = (root: ViewNode, sourceNode: Node): ?ViewNode => {
  const data = root.data;
  if (data.id === sourceNode.id) {
    return root;
  } else if (Array.isArray(root.children)) {
    return root.children
      .map(child => findNode(child, sourceNode))
      .find(x => x !== undefined);
  }
};

class ASTView extends Component {
  ast: Program;
  props: ASTProps;

  componentWillMount() {
    this.props.onReceiveAST(this.props.ast);
  }

  componentWillReceiveProps(nextProps: ASTProps) {
    if (nextProps.ast !== this.props.ast) {
      this.props.onReceiveAST(nextProps.ast);
    }
  }

  render() {
    if (this.props.strata.name) {
      const tree = d3.hierarchy(this.props.strata.toJS());
      const nextTree: ViewNode = d3.hierarchy(this.props.nextStrata.toJS());
      const previousTree: ViewNode = d3.hierarchy(
        this.props.previousStrata.toJS(),
      );
      let i = 0;
      tree.id = i++;
      const addIds = node => {
        node.id = i++;
        if (node.children) {
          node.children.forEach(addIds);
        }
      };
      if (tree.hasOwnProperty("children")) {
        tree.children.forEach(addIds);
      }

      const nodes = tree.descendants();
      let layoutTree = d3
        .tree()
        .nodeSize([NODE_RAD * 5, NODE_RAD * 25])
        .separation(() => 1);

      layoutTree(tree);
      layoutTree(nextTree);
      layoutTree(previousTree);

      mapTreeToNewCoords(tree);
      mapTreeToNewCoords(nextTree);
      mapTreeToNewCoords(previousTree);
      const treeWidth = treeMaxX(tree);
      const treeHeight = treeMaxY(tree);

      const svgWidth = treeWidth + (NODE_RAD + 1) * 2 + NODE_RAD * 25;
      const svgHeight = treeHeight + (NODE_RAD + 1) * 2;

      const sourceNode = findNode(tree, this.props.sourceNode) || tree;
      const nextSourceNode =
        findNode(nextTree, this.props.sourceNode) || nextTree;
      const previousSourceNode =
        findNode(previousTree, this.props.sourceNode) || tree;

      return (
        <TransitionGroup component="div">
          <SVGContainer width={svgWidth} height={svgHeight}>
            <TransitionGroup
              component="g"
              transform={
                "translate(" + (NODE_RAD + 1) + "," + (NODE_RAD + 1) + ")"
              }
            >
              {nodes
                .slice(1)
                .map(node =>
                  <Link
                    key={viewNodeKey(node)}
                    node={node}
                    sourceNode={sourceNode}
                    nextSourceNode={nextSourceNode}
                    previousSourceNode={previousSourceNode}
                  />,
                )}
              {nodes.map(node =>
                <NodeView
                  node={node}
                  key={viewNodeKey(node)}
                  id={viewNodeKey(node)}
                  onHoverNode={this.props.onHoverNode}
                  onStopHoverNode={this.props.onStopHoverNode}
                  onClickNode={this.props.onClickNode}
                  sourceNode={sourceNode}
                  nextSourceNode={nextSourceNode}
                  previousSourceNode={previousSourceNode}
                />,
              )}
            </TransitionGroup>
          </SVGContainer>
        </TransitionGroup>
      );
    } else {
      return null;
    }
  }
}

const SVGContainer = class extends Component<
  void,
  { width: number, height: number, children?: React.Element<*> },
  { width: number, height: number },
> {
  state = { width: 0, height: 0 };
  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width,
      height: this.props.height,
    };
  }

  componentWillReceiveProps(nextProps) {
    let ele = d3.select(ReactDOM.findDOMNode(this));
    if (
      nextProps.height < this.props.height ||
      nextProps.width < this.props.width
    ) {
      ele.transition(
        d3
          .transition()
          .delay(DURATION)
          .attr("height", nextProps.height)
          .attr("width", nextProps.width)
          .on("end", () => {
            this.setState({
              width: nextProps.width,
              height: nextProps.height,
            });
          }),
      );
    }
  }

  render() {
    return (
      <svg width={this.state.width} height={this.state.height}>
        {this.props.children}
      </svg>
    );
  }
};

type NodeViewProps = {
  node: ViewNode,
  id: string,
  onHoverNode: Node => () => void,
  onStopHoverNode: () => () => void,
  onClickNode: Node => () => void,
  sourceNode: ViewNode,
  nextSourceNode: ViewNode,
  previousSourceNode: ViewNode,
};

const NodeView = class extends Component {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  state: {
    x: number,
    y: number,
  };
  props: NodeViewProps;

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

  componentWillAppear(callback) {
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

  componentWillEnter(callback) {
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

  componentWillLeave(callback) {
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
    this.props.onHoverNode(new Node(this.props.node.data));
  }

  onMouseLeave() {
    this.props.onStopHoverNode();
  }

  onClick() {
    this.props.onClickNode(new Node(this.props.node.data), {
      x: this.props.node.x,
      y: this.props.node.y,
    });
  }

  render() {
    let color;
    if (
      this.props.node.data.hiddenChildren &&
      this.props.node.data.hiddenChildren.size > 0
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
};

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

const Link = class extends Component<void, LinkProps, LinkState> {
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

  componentWillAppear(callback) {
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

  componentWillEnter(callback) {
    this.componentWillAppear(callback);
  }

  componentWillLeave(callback) {
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
};

export default ASTView;
