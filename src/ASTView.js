/* @flow */
import React, { Component } from "react";
import ReactDOM from "react-dom";
import TransitionGroup from "react-transition-group/TransitionGroup";
import * as d3 from "d3";
import * as Immutable from "immutable";
import type { Program } from "./interpreter/parser";
import { Node } from "./ASTStratifier";
import type { ASTProps } from "./ASTContainer";

const NODE_RAD = 5;

type ViewNode = {
  children?: Array<ViewNode>,
  x?: number,
  y?: number,
  parent: ?ViewNode,
  data: {
    id: number,
    name: string,
    children: Immutable.List<Node>,
    hiddenChildren: Immutable.List<Node>,
    startPos: number,
    stopPos: number,
  },
};

export function reduceTree<T>(
  root: ViewNode,
  callback: (T, ViewNode) => T,
  initialValue: T,
): T {
  let accumulator = initialValue;
  accumulator = callback(accumulator, root);
  if (root.children) {
    root.children.forEach(child => {
      accumulator = reduceTree(child, callback, accumulator);
    });
  }
  return accumulator;
}

const visitTree = (root: ViewNode, callback: ViewNode => void) => {
  callback(root);
  if (root.children) {
    root.children.forEach(child => {
      visitTree(child, callback);
    });
  }
};

const mapTreeToNewCoords = (tree: ViewNode) => {
  const minX = treeMinX(tree);
  const minY = treeMinY(tree);
  visitTree(tree, (node: ViewNode) => {
    const oldX = node.x;
    const oldY = node.y;
    if (typeof oldX === "number" && typeof oldY === "number") {
      node.x = oldY - minY;
      node.y = oldX - minX;
    }
  });
};

class ASTView extends Component {
  ast: Program;
  props: ASTProps;

  componentWillReceiveProps(nextProps: ASTProps) {
    if (nextProps.nextStrata !== this.props.nextStrata) {
      this.props.onReceivedNextStrata(nextProps.nextStrata);
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

const treeMinX = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevX: number, node: ViewNode) => {
      if (typeof node.x === "number" && node.x < prevX) {
        return node.x;
      } else {
        return prevX;
      }
    },
    Infinity,
  );

const treeMaxX = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevX: number, node: ViewNode) => {
      if (typeof node.x === "number" && node.x > prevX) {
        return node.x;
      } else {
        return prevX;
      }
    },
    -Infinity,
  );

const treeMinY = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevY: number, node: ViewNode) => {
      if (typeof node.y === "number" && node.y < prevY) {
        return node.y;
      } else {
        return prevY;
      }
    },
    Infinity,
  );

const treeMaxY = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevY: number, node: ViewNode) => {
      if (typeof node.y === "number" && node.y > prevY) {
        return node.y;
      } else {
        return prevY;
      }
    },
    0,
  );

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

const SVGContainer = class extends Component<
  void,
  { width: number, height: number, children?: React.Element<*> },
  { width: number, height: number },
> {
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
          .delay(1000)
          .attr("height", nextProps.height)
          .attr("width", nextProps.width)
          .on("end", () => {
            this.setState({
              width: this.nextProps.width,
              height: this.nextProps.height,
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
        .transition(d3.transition().duration(1000))
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
          .transition(d3.transition().duration(1000))
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
      .transition(d3.transition().duration(1000))
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
  sourceX: number;
  sourceY: number;
  parentX: number;
  parentY: number;

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
      .transition(d3.transition().duration(1000))
      .attr(
        "d",
        this.pathShape(
          this.props.node.parent.x,
          this.props.node.parent.y,
          this.props.node.x,
          this.props.node.y,
        ),
      )
      .on("end", () => {
        this.setState({
          startX: this.props.node.parent.x,
          startY: this.props.node.parent.y,
          endX: this.props.node.x,
          endY: this.props.node.y,
        });
        callback();
      });
  }

  componentWillReceiveProps(nextProps: LinkProps) {
    if (
      nextProps.node.x !== this.props.node.x ||
      nextProps.node.y !== this.props.node.y ||
      nextProps.node.parent.x !== this.props.node.parent.x ||
      nextProps.node.parent.y !== this.props.node.parent.y
    ) {
      let ele = d3.select(ReactDOM.findDOMNode(this));
      ele
        .transition(d3.transition().duration(1000))
        .attr(
          "d",
          this.pathShape(
            nextProps.node.parent.x,
            nextProps.node.parent.y,
            nextProps.node.x,
            nextProps.node.y,
          ),
        );
    }
  }

  componentWillEnter(callback) {
    this.componentWillAppear(callback);
  }

  componentWillLeave(callback) {
    let ele = d3.select(ReactDOM.findDOMNode(this));
    ele
      .transition(d3.transition().duration(1000))
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
          x: 0,
          y: 0,
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

const findViewNode = (root: ViewNode, key: string) => {
  if (viewNodeKey(root) === key) {
    return root;
  }
  if (Array.isArray(root.children)) {
    return root.children
      .map(child => findViewNode(child, key))
      .find(x => x !== undefined);
  }
};

const viewNodeKey = (node: ViewNode): string => {
  let key: string;
  if (!node.parent) {
    key = node.data.name;
  } else {
    const parent = node.parent;
    if (Array.isArray(parent.children)) {
      const siblings = parent.children;
      const twins = siblings.filter(
        sibling => sibling.data.name === node.data.name,
      );
      const twinNumber = twins.findIndex(sibling => sibling === node);
      key = viewNodeKey(parent) + ":" + node.data.name + "." + twinNumber;
    } else {
      throw new Error("Parent must have children");
    }
  }
  return key;
};

export default ASTView;
