/* @flow */
import React, { Component } from "react";
import * as d3 from "d3";
import * as Immutable from "immutable";
import type { Program } from "./interpreter/parser";
import { Node } from "./ASTStratifier";

const NODE_RAD = 5;

type ViewNode = {|
  children?: Array<ViewNode>,
  x?: number,
  y?: number,
  parent: ?ViewNode,
  data: {|
    name: string,
  |},
|};

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

class ASTView extends Component {
  ast: Program;

  render() {
    if (this.props.strata) {
      const tree = d3.hierarchy(this.props.strata.toJS());
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
      const minX = reduceTree(
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
      const maxX = reduceTree(
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
      const treeWidth = maxX - minX;
      const treeMidX = (minX + maxX) / 2;
      const maxY = reduceTree(
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
      const svgWidth = maxY + (NODE_RAD + 1) * 2 + NODE_RAD * 25;
      const svgHeight = treeWidth + (NODE_RAD + 1) * 2;
      return (
        <svg width={svgWidth} height={svgHeight}>
          <g
            transform={
              "translate(" +
                NODE_RAD * 25 +
                "," +
                (svgHeight / 2 - treeMidX) +
                ")"
            }
          >
            {nodes
              .slice(1)
              .map((node, idx) => <Link key={nodeKey(node)} node={node} />)}
            {nodes.map(node => (
              <NodeView
                node={node}
                hiddenNodes={this.props.hiddenNodes}
                key={nodeKey(node)}
                id={nodeKey(node)}
                onClick={(node: Node) => {
                  console.log(node);
                }}
                onHoverNode={this.props.onHoverNode}
                onStopHoverNode={this.props.onStopHoverNode}
                onClickNode={this.props.onClickNode}
              />
            ))}
          </g>
        </svg>
      );
    } else {
      return null;
    }
  }
}

const NodeView = (props: {
  node: ViewNode,
  onHoverNode: ({ name: string }) => void,
  onStopHoverNode: () => void,
  onClickNode: ({}) => void,
  id: string,
}) => {
  const onMouseEnter = () => {
    props.onHoverNode(new Node(props.node.data));
  };
  const onMouseLeave = () => {
    props.onStopHoverNode();
  };
  const onClickNode = () => {
    props.onClickNode(new Node(props.node.data));
  };

  let color;
  if (
    props.node.data.hiddenChildren &&
    props.node.data.hiddenChildren.length > 0
  ) {
    color = "lightsteelblue";
  } else {
    color = "white";
  }

  if (typeof props.node.y === "number" && typeof props.node.x === "number") {
    return (
      <g
        transform={"translate(" + props.node.y + "," + props.node.x + ")"}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <circle
          r={NODE_RAD}
          fill={color}
          stroke="steelblue"
          onClick={onClickNode}
        />
        <text
          textAnchor="end"
          alignmentBaseline="middle"
          fontSize="10"
          dx="-10"
        >
          {props.node.data.name}
        </text>
      </g>
    );
  }
  return null;
};

const Link = props => {
  const [pathStartX, pathStartY] = [
    props.node.parent.y + NODE_RAD,
    props.node.parent.x,
  ];
  const [pathEndX, pathEndY] = [props.node.y - NODE_RAD, props.node.x];
  const d =
    "M " +
    pathStartX +
    "," +
    pathStartY +
    "C " +
    (pathStartX + 60) +
    "," +
    pathStartY +
    " " +
    (pathEndX - 60) +
    "," +
    pathEndY +
    " " +
    pathEndX +
    "," +
    pathEndY;
  return <path d={d} stroke="darkgrey" fill="none" />;
};

const nodeKey = (node: ViewNode): string => {
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
      key = nodeKey(parent) + ":" + node.data.name + "." + twinNumber;
    } else {
      throw new Error("Parent must have children");
    }
  }
  return key;
};

export default ASTView;
