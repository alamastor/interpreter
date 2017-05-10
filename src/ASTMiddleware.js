/* @flow */
import type { Program } from "./interpreter/Parser";
import type { ParserInterface } from "./interpreter/Parser";

class ASTMiddleware {
  parser: ParserInterface;
  ast: Program;
  updateAST: Program => void;

  constructor(parser: ParserInterface, updateAST: Program => void) {
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
