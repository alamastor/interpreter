/* @flow */
import { connect } from "react-redux";
import type { State } from "../../store";
import type { Dispatch } from "../../store";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import TransitionGroup from "react-transition-group/TransitionGroup";
import * as d3 from "d3";
import type { Program } from "../../interpreter/parser";
import type { Node } from "./Stratifier";
import NodeView from "./NodeView";
import LinkView from "./LinkView";
import type { ViewNode } from "./tree";
import { mapTreeToNewCoords, treeMaxX, treeMaxY, viewNodeKey } from "./tree";
import { NODE_RAD, DURATION } from "./consts";
import type { Token } from "../../interpreter/Token";
import { bindActionCreators } from "redux";
import type { Action } from "../../actionTypes";
import { UnexpectedToken } from "../../interpreter/Parser";
import {
  onHoverNode,
  onStopHoverNode,
  onClickNode,
  onReceiveTokenList,
  onReceiveNextStrata,
} from "./actions";

const mapStateToProps = (state: State) => ({
  ast: state.ast.ast,
  strata: state.ast.strata,
  nextStrata: state.ast.nextStrata,
  previousStrata: state.ast.previousStrata,
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
      onReceiveNextStrata,
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
  ast: ?Program | UnexpectedToken,
  strata: Node,
  nextStrata: Node,
  sourceNode: Node,
  previousStrata: Node,
  tokenList: Array<Token>,
  onHoverNode: Node => Action,
  onStopHoverNode: () => Action,
  onClickNode: Node => Action,
  onReceiveTokenList: (Array<Token>) => Action,
  onReceiveNextStrata: Node => Action,
};

class ASTView extends Component<void, Props, void> {
  ast: Program;

  componentWillMount() {
    this.props.onReceiveTokenList(this.props.tokenList);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.tokenList !== this.props.tokenList) {
      this.props.onReceiveTokenList(nextProps.tokenList);
    }

    if (nextProps.nextStrata !== this.props.nextStrata) {
      this.props.onReceiveNextStrata(nextProps.nextStrata);
    }
  }

  render() {
    if (this.props.strata.name) {
      const tree = d3.hierarchy(this.props.strata);
      const nextTree: ViewNode = d3.hierarchy(this.props.nextStrata);
      const previousTree: ViewNode = d3.hierarchy(this.props.previousStrata);
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
                  <LinkView
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

const ASTViewContainer = connect(mapStateToProps, mapDispatchToProps)(ASTView);

export default ASTViewContainer;
