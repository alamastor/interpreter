/* @flow */
import Parser from "./interpreter/Parser";
import type { Program } from "./interpreter/Parser";

class ASTMiddleware {
  parser: Parser;
  ast: Program;
  updateAST: Program => void;

  constructor(parser: Parser, updateAST: Program => void) {
    this.parser = parser;
    this.updateAST = updateAST;
  }

  parse() {
    const ast = this.parser.parse();
    this.updateAST(ast);
    return ast;
  }
}

export default ASTMiddleware;
