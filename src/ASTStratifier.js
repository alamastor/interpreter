import type { AST, BinOp, UnaryOp, Num } from "./interpreter/parser";
import * as Immutable from "immutable";

const Node = Immutable.Record(
  ({
    name: "",
    children: new Immutable.List(),
    hiddenChildren: new Immutable.List(),
    startPos: 0,
    endPos: 0,
  }: {
    name: string,
    children: Immutable.List<Node>,
    hiddenChildren: Immutable.List<Node>,
    startPos: number,
    endPos: number,
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
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    return new Node({
      name: "BinOp:" + node.op.type,
      children: Immutable.List([left, right]),
      startPos: left.startPos,
      endPos: right.endPos,
    });
  }

  visitUnaryOp(node: UnaryOp): Node {
    const expr = this.visit(node.expr);
    return new Node({
      name: "UnaryOp:" + node.op.type,
      children: Immutable.List([expr]),
      startPos: node.op.startPos,
      endPos: expr.endPos,
    });
  }

  visitNum(node: Num) {
    return new Node({
      name: "Num: " + node.token.value,
      startPos: node.token.startPos,
      endPos: node.token.endPos,
    });
  }
}

export { Node };
export default Stratifier;
