/* @flow */
import { connect } from "react-redux";
import ASTView from "./view";
import type { State } from "../../store";

const mapStateToProps = (state: State) => ({
  ast: state.code.ast,
  strata: state.astView.strata,
  nextStrata: state.astView.nextStrata,
  previousStrata: state.astView.previousStrata,
  sourceNode: state.astView.sourceNode,
});

const mapDispatchToProps = (dispatch: *) => ({
  onHoverNode: node =>
    dispatch({
      type: "ast_node_hover",
      node: node,
    }),
  onStopHoverNode: () =>
    dispatch({
      type: "ast_node_hover_stop",
    }),
  onClickNode: node =>
    dispatch({
      type: "ast_node_click",
      node: node,
    }),
  onReceiveAST: ast => {
    if (ast) {
      return dispatch({
        type: "ast_received_ast",
        ast: ast,
      });
    }
  },
});

const ASTViewContainer = connect(mapStateToProps, mapDispatchToProps)(ASTView);

export default ASTViewContainer;
