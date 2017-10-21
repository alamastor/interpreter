/* @flow */
import type { Action } from "../../actionTypes.js";
import type { ParserOutput } from "../../interpreter/Parser";
import Parser from "../../interpreter/Parser";
import ASTStratifier from "./Stratifier";
import type { Node } from "./Stratifier";
import { updateChildNode } from "./tree";

const toggleChildren = (node: Node): Node =>
  Object.assign({}, node, {
    hiddenChildren: node.children,
    children: node.hiddenChildren,
  });

type ASTViewState = {
  parserOutput: ParserOutput,
  strata: Node,
  sourceNode: Node,
};

export const emptyStrata: Node = {
  id: "",
  name: "",
  startPos: 0,
  stopPos: 0,
};

const initialState: ASTViewState = {
  parserOutput: {
    ast: null,
    error: "",
  },
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
      const parserOutput = new Parser(action.tokenList).parse();
      if (parserOutput.ast == null) {
        return Object.assign({}, state, {
          parserOuput: parserOutput,
          strata: emptyStrata,
          sourceNode: emptyStrata,
        });
      }
      const strata = new ASTStratifier(parserOutput.ast).build();
      return Object.assign({}, state, {
        parserOutput: parserOutput,
        strata: strata,
        sourceNode: emptyStrata,
      });

    default:
      return state;
  }
};

export default ASTView;
