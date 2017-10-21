/* @flow */
import { connect } from "react-redux";
import type { State } from "../../store";
import React, { Component } from "react";
import * as d3 from "d3";
import type { ParserOutput } from "../../interpreter/Parser";
import type { Node } from "./Stratifier";
import type { ViewNode } from "./tree";
import { mapTreeToNewCoords, treeMaxX, treeMaxY, viewNodeKey } from "./tree";
import { NODE_RAD, DURATION } from "./consts";
import type { Token } from "../../interpreter/Token";
import { bindActionCreators } from "redux";
import type { Action } from "../../actionTypes";
import {
  onHoverNode,
  onStopHoverNode,
  onClickNode,
  onReceiveTokenList,
} from "./actions";
import "./index.css";
import { emptyStrata } from "./reducer";

const mapStateToProps = (state: State) => ({
  parserOutput: state.ast.parserOutput,
  strata: state.ast.strata,
  sourceNode: state.ast.sourceNode,
  tokenList: state.lexer.tokenList,
});

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      onHoverNode,
      onStopHoverNode,
      onClickNode,
      onReceiveTokenList,
    },
    dispatch,
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

type Props = {
  parserOutput: ParserOutput,
  strata: Node,
  sourceNode: Node,
  tokenList: Array<Token>,
  onHoverNode: Node => Action,
  onStopHoverNode: () => Action,
  onClickNode: Node => Action,
  onReceiveTokenList: (Array<Token>) => Action,
};

class ASTView extends Component<void, Props, void> {
  parserOutput: ParserOutput;
  svg: ?HTMLElement;
  containerGroup: ?HTMLElement;
  redrawAST: (?Props) => void;
  clickNode: Node => void;
  hoverNode: Node => void;
  stopHoverNode: Node => void;

  constructor(props) {
    super(props);
    this.redrawAST = this.redrawAST.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.hoverNode = this.hoverNode.bind(this);
    this.stopHoverNode = this.stopHoverNode.bind(this);
  }

  componentWillMount() {
    this.props.onReceiveTokenList(this.props.tokenList);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.tokenList !== this.props.tokenList) {
      this.props.onReceiveTokenList(nextProps.tokenList);
      d3
        .select(this.svg)
        .attr("width", 0)
        .attr("height", 0);
      d3
        .select(this.containerGroup)
        .selectAll("*")
        .remove();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.strata !== prevProps.strata &&
      this.props.strata !== emptyStrata
    ) {
      this.redrawAST(prevProps);
    }
  }

  clickNode(node) {
    this.props.onClickNode(node.data);
  }

  hoverNode(node) {
    this.props.onHoverNode(node.data);
  }

  stopHoverNode() {
    this.props.onStopHoverNode();
  }

  redrawAST(prevProps: Props) {
    const tree = d3.hierarchy(this.props.strata);
    let previousTree;
    if (prevProps) {
      previousTree = d3.hierarchy(prevProps.strata);
    } else {
      previousTree = tree;
    }

    const nodes = tree.descendants();
    const layoutTree = d3
      .tree()
      .nodeSize([NODE_RAD * 5, NODE_RAD * 25])
      .separation(() => 1);

    layoutTree(tree);
    layoutTree(previousTree);

    mapTreeToNewCoords(tree);
    mapTreeToNewCoords(previousTree);

    const treeWidth = treeMaxX(tree);
    const treeHeight = treeMaxY(tree);
    const previousTreeWidth = treeMaxX(previousTree);
    const previousTreeHeight = treeMaxY(previousTree);

    const svgWidth = treeWidth + (NODE_RAD + 1) * 2 + NODE_RAD * 25;
    const svgHeight = treeHeight + (NODE_RAD + 1) * 2;
    const previousSvgWidth =
      previousTreeWidth + (NODE_RAD + 1) * 2 + NODE_RAD * 25;
    const previousSvgHeight = previousTreeHeight + (NODE_RAD + 1) * 2;

    const sourceNode = findNode(tree, this.props.sourceNode) || tree;
    const previousSourceNode =
      findNode(previousTree, this.props.sourceNode) || tree;

    const svg = d3
      .select(this.svg)
      .attr("width", Math.max(svgWidth, previousSvgWidth))
      .attr("height", Math.max(svgHeight, previousSvgHeight));

    const containerGroup = d3
      .select(this.containerGroup)
      .attr("class", "svg-container")
      .attr(
        "transform",
        "translate(" + (NODE_RAD + 1) + "," + (NODE_RAD + 1) + ")",
      );

    svg
      .transition()
      .duration(DURATION)
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const node = containerGroup.selectAll("g.node").data(nodes, viewNodeKey);

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        "translate(" +
          (previousSourceNode.x || 0) +
          "," +
          (previousSourceNode.y || 0) +
          ")",
      )
      .on("click", this.clickNode)
      .on("mouseover", this.hoverNode)
      .on("mouseout", this.stopHoverNode);

    nodeEnter
      .append("circle")
      .classed("node-circle", true)
      .attr("r", NODE_RAD);

    nodeEnter
      .append("text")
      .attr("class", "node-text")
      .attr("x", "1em")
      .attr("dy", "0.35em")
      .style("fill-opacity", 1e-6)
      .text(d => d.data.name);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.classed(
      "hidden-children",
      d => (d.hiddenChildren ? true : false),
    );
    nodeUpdate
      .transition()
      .duration(DURATION)
      .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    nodeUpdate
      .select("text")
      .transition()
      .duration(DURATION)
      .style("fill-opacity", 1);
    nodeUpdate
      .select("circle")
      .attr("fill", d => (d.data.hiddenChildren ? "#999" : "#333"));

    const nodeExit = node
      .exit()
      .transition()
      .duration(DURATION)
      .attr(
        "transform",
        "translate(" + (sourceNode.x || 0) + "," + (sourceNode.y || 0) + ")",
      )
      .remove();
    nodeExit.select("text").style("fill-opacity", 1e-6);
    nodeExit.style("fill-opacity", 1e-6).style("stroke-opacity", 1e-6);

    const link = containerGroup
      .selectAll("path.link")
      .data(nodes.slice(1), viewNodeKey);

    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", this.path(previousSourceNode, previousSourceNode));

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
      .transition()
      .duration(DURATION)
      .attr("d", d => this.path(d.parent, d));

    link
      .exit()
      .transition()
      .duration(DURATION)
      .attr("d", this.path(sourceNode, sourceNode))
      .remove();
  }

  path(source, dest) {
    return `M ${source.x || 0} ${source.y || 0}
            C ${(source.x + dest.x) / 2} ${source.y || 0},
              ${(source.x + dest.x) / 2} ${dest.y || 0},
              ${dest.x || 0} ${dest.y || 0}`;
  }

  render() {
    return (
      <svg
        ref={svg => {
          this.svg = svg;
        }}
      >
        <g
          ref={g => {
            this.containerGroup = g;
          }}
        />
      </svg>
    );
  }
}

const ASTViewContainer = connect(mapStateToProps, mapDispatchToProps)(ASTView);

export default ASTViewContainer;
