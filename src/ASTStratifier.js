import type { AST, BinOp, UnaryOp, Num } from "./interpreter/parser";
import * as Immutable from "immutable";

const Node = Immutable.Record(
  ({
    name: "",
    children: new Immutable.List(),
    hiddenChildren: new Immutable.List(),
  }: {
    name: string,
    children: Immutable.List<Node>,
    hiddenChildren: Immutable.List<Node>,
  }),
);

class Stratifier {
  ast: AST;

  constructor(ast: AST) {
    this.ast = ast;
  }

  build() {
    return this.visit(this.ast);
  }

  visit(node: AST): Node {
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
    return new Node({
      name: "BinOp:" + node.op.type,
      children: Immutable.List([this.visit(node.left), this.visit(node.right)]),
    });
  }

  visitUnaryOp(node: UnaryOp): Node {
    return new Node({
      name: "UnaryOp:" + node.op.type,
      children: Immutable.List([this.visit(node.expr)]),
    });
  }

  visitNum(node: Num) {
    return new Node({
      name: "Num: " + node.token.value,
    });
  }
}

export { Node };
export default Stratifier;
