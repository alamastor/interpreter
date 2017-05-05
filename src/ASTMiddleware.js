import Parser from './interpreter/Parser'

class ASTMiddleware {
  parser: Parser
  updateAST: Function

  constructor(parser: Parser, updateAST: Function) {
    this.parser = parser
    this.updateAST = updateAST
  }

  parse() {
    const ast = this.parser.parse()
    this.updateAST(ast)
    return ast
  }
}

export default ASTMiddleware