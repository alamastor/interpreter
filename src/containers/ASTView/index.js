/* @flow */
import { connect } from "react-redux";
import type { State } from "../../store";
import React, { Component } from "react";
import * as d3 from "d3";
import type { Program } from "../../interpreter/Parser";
import type { Node } from "./Stratifier";
import {
  mapTreeToNewCoords,
  treeMaxX,
  treeMaxY,
  viewNodeKey,
  getYoungestExistingParent,
  findNode,
} from "./tree";
import { NODE_RAD, DURATION } from "./consts";
import type { Token } from "../../interpreter/Token";
import { bindActionCreators } from "redux";
import type { Action } from "../../actionTypes";
import {
  onHoverNode,
  onStopHoverNode,
  onClickNode,
  onReceiveAST,
} from "./actions";
import "./index.css";

const mapStateToProps = (state: State) => ({
  ast: state.interpreterPage.ast,
  strata: state.astView.strata,
  tokenList: state.lexerView.tokenList,
});

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      onReceiveAST,
      onHoverNode,
      onStopHoverNode,
      onClickNode,
    },
    dispatch,
  );

type Props = {
  ast: ?Program,
  strata: Node,
  tokenList: Array<Token>,
  onHoverNode: Node => Action,
  onStopHoverNode: () => Action,
  onClickNode: Node => Action,
  onReceiveAST: (?Program) => Action,
};

class ASTView extends Component<void, Props, void> {
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
    this.props.onReceiveAST(this.props.ast);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.ast !== this.props.ast) {
      this.props.onReceiveAST(nextProps.ast);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.strata !== prevProps.strata) {
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

    const enteringNodes = new Set(
      node
        .enter()
        .nodes()
        .map(d => d.__data__),
    );
    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => {
        const sourceInNewTree = getYoungestExistingParent(d, enteringNodes);
        const sourceNode =
          findNode(previousTree, sourceInNewTree) || sourceInNewTree;
        return (
          "translate(" + (sourceNode.x || 0) + "," + (sourceNode.y || 0) + ")"
        );
      })
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
      .style("fill-opacity", 1)
      .text(d => d.data.name);
    nodeUpdate
      .select("circle")
      .attr("fill", d => (d.data.hiddenChildren ? "#999" : "#333"));

    const exitingNodes = new Set(
      node
        .exit()
        .nodes()
        .map(d => d.__data__),
    );
    const nodeExit = node
      .exit()
      .transition()
      .duration(DURATION)
      .attr("transform", d => {
        const destInOldTree = getYoungestExistingParent(d, exitingNodes);
        const destNode = findNode(tree, destInOldTree) || destInOldTree;
        return "translate(" + (destNode.x || 0) + "," + (destNode.y || 0) + ")";
      })
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
      .attr("d", d => {
        const sourceInNewTree = getYoungestExistingParent(d, enteringNodes);
        const fn = findNode(previousTree, sourceInNewTree);
        console.log(fn);
        const sourceNode =
          findNode(previousTree, sourceInNewTree) || sourceInNewTree;
        return this.path(sourceNode, sourceNode);
      });

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
      .transition()
      .duration(DURATION)
      .attr("d", d => this.path(d.parent, d));

    link
      .exit()
      .transition()
      .duration(DURATION)
      .attr("d", d => {
        const destInOldTree = getYoungestExistingParent(d, exitingNodes);
        const destNode = findNode(tree, destInOldTree) || destInOldTree;
        return this.path(destNode, destNode);
      })
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
