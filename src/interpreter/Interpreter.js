import typeof Parser from './Parser'
import type { AST } from './Parser'

class Interpreter {
  parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser
  }

  visit(node: AST) {
    switch (node.type) {
      case 'bin_op':
        return this.visitBinOp(node)
      case 'num':
        return this.visitNum(node)
      default:
        throw new Error('No visit method for ' + node.type + '.')
    }
  }

  visitBinOp(node: AST) {
    switch(node.op.type) {
      case 'PLUS':
        return this.visit(node.left) + this.visit(node.right)
      case 'MINUS':
        return this.visit(node.left) - this.visit(node.right)
      case 'MUL':
        return this.visit(node.left) * this.visit(node.right)
      case 'DIV':
        return this.visit(node.left) / this.visit(node.right)
      default:
        throw new Error('Unexpected op type: ' + node.op.type)
    }
  }

  visitNum(node: AST) {
    return node.token.value
  }

  interpret(): string {
    try {
      const tree = this.parser.parse();
      return this.visit(tree).toString()
    } catch (e) {
      return 'Error: ' + e.message
    }
  }
}

export default Interpreter