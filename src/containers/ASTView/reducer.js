/* @flow */
import type { Action } from "../../actionTypes.js";
import ASTStratifier, { emptyStrata } from "./Stratifier";
import type { Node } from "./Stratifier";
import { replaceNodeInTree } from "./tree";

const toggleChildren = (node: Node): Node =>
  Object.assign({}, node, {
    hiddenChildren: node.children,
    children: node.hiddenChildren,
  });

type ASTViewState = {
  strata: Node,
};

const initialState: ASTViewState = {
  strata: emptyStrata,
};

const ASTView = (
  state: ASTViewState = initialState,
  action: Action,
): ASTViewState => {
  switch (action.type) {
    case "ast_view_node_click":
      return Object.assign({}, state, {
        strata: replaceNodeInTree(
          state.strata,
          action.node,
          toggleChildren(action.node),
        ),
      });

    case "ast_view_received_ast":
      const ast = action.ast;
      if (ast == null) {
        return Object.assign({}, state, {
          strata: emptyStrata,
        });
      }
      const strata = new ASTStratifier(ast).build();
      return Object.assign({}, state, {
        strata: strata,
      });

    default:
      return state;
  }
};

export default ASTView;
