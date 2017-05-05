import type { AST } from "./interpreter/parser";

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
      case "num":
        return this.visitNum(node);
      default:
        throw new Error("No visit method for " + node.type + ".");
    }
  }

  visitBinOp(node: AST): Node {
    if (node.type === "bin_op") {
      return {
        name: "BinOp:" + node.op.type,
        children: [this.visit(node.left), this.visit(node.right)],
        hiddenChildren: [],
      };
    } else {
      throw new Error(
        'Invalid node type: expected "bin_op", got "' + node.type + '".',
      );
    }
  }

  visitNum(node: AST) {
    if (node.type === "num") {
      return {
        name: "Num: " + node.token.value,
        children: [],
        hiddenChildren: [],
      };
    } else {
      throw new Error(
        'Invalid node type: expected "num", got "' + node.type + '".',
      );
    }
  }
}

export { Node };
export default Stratifier;
