/* @flow */
import type { Action } from "../../actionTypes.js";
import ASTStratifier from "./Stratifier";
import type { Node } from "./Stratifier";
import { updateChildNode } from "./tree";

const toggleChildren = (node: Node): Node =>
  Object.assign({}, node, {
    hiddenChildren: node.children,
    children: node.hiddenChildren,
  });

type ASTViewState = {
  strata: Node,
  sourceNode: Node,
};

export const emptyStrata: Node = {
  id: "",
  name: "",
  type: "",
  startPos: 0,
  stopPos: 0,
};

const initialState: ASTViewState = {
  strata: emptyStrata,
  sourceNode: emptyStrata,
};

const ASTView = (
  state: ASTViewState = initialState,
  action: Action,
): ASTViewState => {
  switch (action.type) {
    case "ast_view_node_click":
      return Object.assign({}, state, {
        strata: updateChildNode(
          state.strata,
          action.node,
          toggleChildren(action.node),
        ),
        sourceNode: action.node,
      });

    case "ast_view_received_ast":
      const ast = action.ast;
      if (ast == null) {
        return Object.assign({}, state, {
          strata: emptyStrata,
          sourceNode: emptyStrata,
        });
      }
      const strata = new ASTStratifier(ast).build();
      return Object.assign({}, state, {
        strata: strata,
        sourceNode: emptyStrata,
      });

    default:
      return state;
  }
};

export default ASTView;
