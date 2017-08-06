/* @flow */
import type { Action } from "../../actionTypes.js";
import ASTStratifier from "../../ASTStratifier";
import type { Node } from "../../ASTStratifier";

const updateChildNode = (root: Node, oldChild: Node, newChild: Node) => {
  if (!root.children) {
    return root;
  }
  const oldChildren = root.children;
  const oldChildIndex = oldChildren.indexOf(oldChild);
  if (oldChildIndex !== -1) {
    const newChildren = [
      ...oldChildren.slice(0, oldChildIndex),
      newChild,
      ...oldChildren.slice(oldChildIndex + 1),
    ];
    return Object.assign({}, root, {
      children: newChildren,
    });
  }
  return Object.assign({}, root, {
    children: oldChildren.map(child =>
      updateChildNode(child, oldChild, newChild),
    ),
  });
};

const toggleChildren = (node: Node): Node =>
  Object.assign({}, node, {
    hiddenChildren: node.children,
    children: node.hiddenChildren,
  });

type ASTViewState = {
  strata: Node,
  nextStrata: Node,
  sourceNode: Node,
  previousStrata: Node,
};

const initialState: ASTViewState = {
  strata: {
    id: 0,
    name: "",
    startPos: 0,
    stopPos: 0,
  },
  nextStrata: {
    id: 0,
    name: "",
    startPos: 0,
    stopPos: 0,
  },
  sourceNode: {
    id: 0,
    name: "",
    startPos: 0,
    stopPos: 0,
  },
  previousStrata: {
    id: 0,
    name: "",
    startPos: 0,
    stopPos: 0,
  },
};

const ASTView = (
  state: ASTViewState = initialState,
  action: Action,
): ASTViewState => {
  switch (action.type) {
    case "ast_node_click":
      return Object.assign({}, state, {
        nextStrata: updateChildNode(
          state.strata,
          action.node,
          toggleChildren(action.node),
        ),
        sourceNode: action.node,
      });

    case "ast_received_ast":
      if (action.ast) {
        const strata = new ASTStratifier(action.ast).build();
        return Object.assign({}, state, {
          strata: strata,
          previousStrata: strata,
        });
      } else {
        return state;
      }

    case "ast_received_next_strata":
      return Object.assign({}, state, {
        strata: action.strata,
        previousStrata: action.strata,
      });

    default:
      return state;
  }
};

export default ASTView;
