import type { AST, BinOp, UnaryOp, Num } from "./interpreter/parser";

type Node = {
  children: Array<Node>,
  hiddenChildren: Array<Node>,
  name: string,
};

class Stratifier {
  ast: AST;

  constructor(ast: AST) {
    this.ast = ast;
  }

  build() {
    return this.visit(this.ast);
  }

  visit(node: AST) {
    switch (node.type) {
      case "bin_op":
        return this.visitBinOp(node);
      case "unary_op":
        return this.visitUnaryOp(node);
      case "num":
        return this.visitNum(node);
      default:
        throw new Error("No visit method for " + node.type + ".");
    }
  }

  visitBinOp(node: BinOp): Node {
    return {
      name: "BinOp:" + node.op.type,
      children: [this.visit(node.left), this.visit(node.right)],
      hiddenChildren: [],
    };
  }

  visitUnaryOp(node: UnaryOp): Node {
    return {
      name: "UnaryOp:" + node.op.type,
      children: [this.visit(node.expr)],
      hiddenChildren: [],
    };
  }

  visitNum(node: Num) {
    return {
      name: "Num: " + node.token.value,
      children: [],
      hiddenChildren: [],
    };
  }
}

export type { Node };
export default Stratifier;
