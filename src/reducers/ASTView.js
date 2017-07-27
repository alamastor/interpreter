/* @flow */
import * as Immutable from "immutable";
import { Node } from "../ASTStratifier";
import type { Action } from "../actionTypes.js";
import Parser from "../interpreter/Parser";
import Lexer from "../interpreter/Lexer";
import ASTMiddleware from "../ASTMiddleware";
import type { Program } from "../interpreter/Parser";
import Interpreter from "../interpreter/Interpreter";
import ASTStratifier from "../ASTStratifier";

export const ASTViewState = Immutable.Record(
  ({
    strata: new Node({}),
    nextStrata: new Node({}),
    sourceNode: new Node({}),
    previousStrata: new Node({}),
  }: {
    strata: Node,
    nextStrata: Node,
    sourceNode: Node,
    previousStrata: Node,
  }),
);

const ASTView = (state: ASTViewState = new ASTViewState(), action: Action) => {
  switch (action.type) {
    case "code_update":
      if (action.code !== "") {
        const parser = new Parser(new Lexer(action.code));
        let programAST: Program;
        const interpreterOutput = new Interpreter(
          new ASTMiddleware(parser, ast => {
            programAST = ast;
          }),
        ).interpret();

        const strata = new ASTStratifier(programAST).build();
        return state.set("strata", strata).set("sourceNode", strata);
      } else {
        return state;
      }

    case "ast_node_click":
      return state
        .set(
          "nextStrata",
          updateChildNode(
            state.strata,
            action.node,
            toggleChildren(action.node),
          ),
        )
        .set("sourceNode", action.node);

    case "ast_received_next_strata":
      return state
        .set("strata", action.strata)
        .set("previousStrata", state.strata);

    default:
      return state;
  }
};

const updateChildNode = (root: Node, oldChild: Node, newChild: Node) => {
  if (!root.children) {
    return root;
  }
  if (root.children.indexOf(oldChild) !== -1) {
    return root.set(
      "children",
      root.children.set(root.children.indexOf(oldChild), newChild),
    );
  }
  return root.set(
    "children",
    root.children.map(child => {
      return updateChildNode(child, oldChild, newChild);
    }),
  );
};

const toggleChildren = (node: Node) => {
  return node
    .set("hiddenChildren", node.children)
    .set("children", node.hiddenChildren);
};

export default ASTView;
