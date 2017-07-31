/* @flow */
import { connect } from "react-redux";
import type { MapDispatchToProps } from "react-redux";
import { Node } from "../../ASTStratifier";
import type { ASTNode } from "../../interpreter/Parser";
import type { Action } from "../../actionTypes";
import ASTView from "./view";

type StateProps = {
  ast: ASTNode,
  strata: Node,
  nextStrata: Node,
  sourceNode: Node,
  previousStrata: Node,
};

const mapStateToProps = (state): StateProps => {
  return {
    ast: state.code.ast,
    strata: state.astView.strata,
    nextStrata: state.astView.nextStrata,
    previousStrata: state.astView.previousStrata,
    sourceNode: state.astView.sourceNode,
  };
};

type DispatchProps = {
  onHoverNode: Node => () => void,
  onStopHoverNode: () => () => void,
  onClickNode: Node => () => void,
  onReceiveAST: ASTNode => () => void,
};

const mapDispatchToProps: MapDispatchToProps<
  Action,
  *,
  DispatchProps,
> = dispatch => ({
  onHoverNode: node =>
    dispatch({
      type: "ast_node_hover",
      node: node,
    }),
  onStopHoverNode: () =>
    dispatch({
      type: "ast_node_hover_stop",
    }),
  onClickNode: (node, nodePosition) =>
    dispatch({
      type: "ast_node_click",
      node: node,
      nodePosition: nodePosition,
    }),
  onReceiveAST: ast =>
    dispatch({
      type: "ast_received_ast",
      ast: ast,
    }),
});

const ASTViewContainer = connect(mapStateToProps, mapDispatchToProps)(ASTView);

export type ASTProps = StateProps & DispatchProps;

export default ASTViewContainer;
