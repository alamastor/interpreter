/* @flow */
import React, { Component } from "react";
import * as d3 from "d3";
import type { AST } from "./interpreter/parser";

const NODE_RAD = 25;

type Node = {|
  children?: Array<Node>,
  x?: number,
  y?: number,
  parent: ?Node,
|};

function reduceTree<T>(
  root: Node,
  callback: (T, Node) => T,
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
  ast: AST;

  render() {
    if (this.props.strata) {
      const tree = d3.hierarchy(this.props.strata);
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
      let layoutTree = d3.tree().nodeSize([NODE_RAD * 3, NODE_RAD * 3]);
      layoutTree(tree);
      const minX = reduceTree(
        tree,
        (prevX: number, node: Node) => {
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
        (prevX: number, node: Node) => {
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
        (prevY: number, node: Node) => {
          if (typeof node.y === "number" && node.y > prevY) {
            return node.y;
          } else {
            return prevY;
          }
        },
        0,
      );
      const svgWidth = treeWidth + (NODE_RAD + 1) * 2;
      return (
        <svg width={svgWidth} height={maxY + (NODE_RAD + 1) * 2}>
          <g
            transform={
              "translate(" +
                (svgWidth / 2 - treeMidX) +
                "," +
                (NODE_RAD + 1) +
                ")"
            }
          >
            {nodes.map(node => (
              <NodeView
                node={node}
                key={node.id}
                onClick={(node: Node) => {
                  console.log(node);
                }}
              />
            ))}
            {nodes.slice(1).map((node, idx) => <Link key={idx} node={node} />)}
          </g>
        </svg>
      );
    } else {
      return null;
    }
  }
}

const NodeView = props => {
  const onClick = () => {
    props.onClick(props.node);
  };
  return (
    <g
      transform={"translate(" + props.node.x + "," + props.node.y + ")"}
      onClick={onClick}
    >
      <circle r={NODE_RAD} fill="lightsteelblue" stroke="steelblue" />
      <text textAnchor="middle" alignmentBaseline="middle" fontSize="8">
        {props.node.data.name}
      </text>
    </g>
  );
};

const Link = props => {
  const [pathStartX, pathStartY] = [
    props.node.parent.x,
    props.node.parent.y + NODE_RAD,
  ];
  const [pathEndX, pathEndY] = [props.node.x, props.node.y - NODE_RAD];
  const d =
    "M " +
    pathStartX +
    "," +
    pathStartY +
    "C " +
    pathStartX +
    "," +
    (pathStartY + 10) +
    " " +
    pathEndX +
    "," +
    (pathEndY - 10) +
    " " +
    pathEndX +
    "," +
    pathEndY;
  return <path d={d} stroke="darkgrey" fill="none" />;
};

export default ASTView;
