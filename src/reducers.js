/* @flow */
import type { Action } from "./actionTypes.js";
import * as Immutable from "immutable";
import type { Token } from "./interpreter/Token";
import ASTStratifier, { Node } from "./ASTStratifier";

const CodeState = Immutable.Record(
  ({
    code: "",
    highlightStart: 0,
    highlightStop: 0,
  }: {
    code: string,
    highlightStart: number,
    highlightStop: number,
  }),
);

const code = (
  state: CodeState = new CodeState(),
  action: Action,
): CodeState => {
  switch (action.type) {
    case "code_update":
      return state.set("code", action.code);
    case "token_hover":
      return state
        .set("highlightStart", action.tokenOrError.startPos)
        .set("highlightStop", action.tokenOrError.endPos);
    case "token_stop_hover":
      return state.set("highlightStart", 0).set("highlightStop", 0);
    default:
      return state;
  }
};

const InterpreterState = Immutable.Record(
  ({
    output: "",
  }: {
    output: string,
  }),
);

const interpreter = (
  state: InterpreterState = new InterpreterState(),
  action: Action,
) => {
  switch (action.type) {
    case "interpreter_output_update":
      return state.set("output", action.output);
    default:
      return state;
  }
};

const ParserState = Immutable.Record(
  ({
    grammar: Immutable.List(),
  }: {
    grammar: Immutable.List<string>,
  }),
);

const parser = (state: ParserState = new ParserState(), action: Action) => {
  switch (action.type) {
    case "parser_grammar_update":
      return state.set("grammar", Immutable.List(action.grammar));
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
      return Immutable.List();
    case "token_list_push":
      return state.push(action.token);
    default:
      return state;
  }
};

const ASTVisState = Immutable.Record(
  ({
    strata: null,
  }: {
    strata: ?Node,
  }),
);

const astVis = (state: ASTVisState = new ASTVisState(), action: Action) => {
  switch (action.type) {
    case "parser_ast_update":
      return state.set("strata", new ASTStratifier(action.ast).build());
    default:
      return state;
  }
};

export { code, interpreter, parser, tokenList, astVis };
