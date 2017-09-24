/* @flow */
import type { Action } from "../../actionTypes.js";
import type { Program } from "../../interpreter/Parser";
import Parser, { UnexpectedToken } from "../../interpreter/Parser";
import ASTStratifier from "./Stratifier";
import type { Node } from "./Stratifier";

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
  ast: ?Program | UnexpectedToken,
  strata: Node,
  sourceNode: Node,
};

const emptyStrata: Node = {
  id: "",
  name: "",
  startPos: 0,
  stopPos: 0,
};

const initialState: ASTViewState = {
  ast: null,
  strata: emptyStrata,
  sourceNode: emptyStrata,
};

const ASTView = (
  state: ASTViewState = initialState,
  action: Action,
): ASTViewState => {
  switch (action.type) {
    case "ast_node_click":
      return Object.assign({}, state, {
        strata: updateChildNode(
          state.strata,
          action.node,
          toggleChildren(action.node),
        ),
        sourceNode: action.node,
      });

    case "ast_received_token_list":
      const ast = new Parser(action.tokenList).parse();
      if (ast instanceof UnexpectedToken || ast == null) {
        return Object.assign({}, state, {
          ast: ast,
          strata: emptyStrata,
        });
      }
      const strata = new ASTStratifier(ast).build();
      return Object.assign({}, state, {
        ast: ast,
        strata: strata,
      });

    default:
      return state;
  }
};

export default ASTView;
