/* @flow */
import type { Action } from "./actionTypes.js";
import * as Immutable from "immutable";
import type { Token } from "./interpreter/Token";
import ASTStratifier from "./ASTStratifier";
import type { Node } from "./ASTStratifier";

const code = (state: string = "", action: Action) => {
  switch (action.type) {
    case "code_update":
      return action.code;

    default:
      return state;
  }
};

const InterpreterState = Immutable.Record({
  output: "",
});

const interpreter = (
  state: InterpreterState = new InterpreterState(),
  action: Action,
) => {
  switch (action.type) {
    case "interpreter_version_update":
      return state.set("interpreterVersion", action.version);
    case "interpreter_output_update":
      return state.set("output", action.output);
    default:
      return state;
  }
};

const ParserState = Immutable.Record({
  grammar: [],
  ast: null,
});

const parser = (state: ParserState = new ParserState(), action: Action) => {
  switch (action.type) {
    case "parser_grammar_update":
      return state.set("grammar", action.grammar);
    default:
      return state;
  }
};

const tokenList = (
  state: Immutable.List<Token> = new Immutable.List(),
  action: Action,
) => {
  switch (action.type) {
    case "token_list_reset":
      return new Immutable.List();
    case "token_list_push":
      return state.push(action.token);
    default:
      return state;
  }
};

const ASTVisState = Immutable.Record({
  strata: null,
});

const astVis = (state: ASTVisState = new ASTVisState(), action: Action) => {
  switch (action.type) {
    case "parser_ast_update":
      return state.set("strata", new ASTStratifier(action.ast).build());
    default:
      return state;
  }
};

const collape = (node: Node) => {
  if (node.children) {
    node.children.forEach(node => collape(node));
    node.collapsedChildren = node.children;
    delete node.children;
  }
};

const toggle = (node: Node) => {
  if (node.children) {
    node.collapsedChildren = node.children;
    delete node.children;
  } else if (node.collapsedChildren) {
    node.children = node.collapsedChildren;
    delete node.collapsedChildren;
  }
};

export { code, interpreter, parser, tokenList, astVis };
