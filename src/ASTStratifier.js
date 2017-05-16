import type {
  Assign,
  BinOp,
  Block,
  Compound,
  NoOp,
  Num,
  Program,
  Type,
  UnaryOp,
  Var,
  VarDecl,
} from "./interpreter/parser";
import * as Immutable from "immutable";

const NodeBase = Immutable.Record(
  ({
    name: "",
    children: new Immutable.List(),
    hiddenChildren: new Immutable.List(),
    startPos: 0,
    stopPos: 0,
  }: {
    name: string,
    children: Immutable.List<Node>,
    hiddenChildren: Immutable.List<Node>,
    startPos: number,
    stopPos: number,
  }),
);

const Node = class extends NodeBase {
  constructor(values: {
    name?: string,
    children?: Immutable.List<Node>,
    hiddenChildren?: Immutable.List<Node>,
    startPos?: number,
    stopPos?: number,
  }) {
    // Convert children to this record type to allow deep
    // convertion to records.
    if (values && Array.isArray(values.children)) {
      values.children = Immutable.List(
        values.children.map(child => new Node(child)),
      );
    }
    if (values && Array.isArray(values.hiddenChildren)) {
      values.hiddenChildren = Immutable.List(
        values.hiddenChildren.map(child => new Node(child)),
      );
    }
    super(values);
  }
};

class Stratifier {
  ast: ?Program;

  constructor(ast: ?Program) {
    this.ast = ast;
  }

  build() {
    if (this.ast) {
      return this.visitProgram(this.ast);
    }
  }

  visitAssign(assign: Assign): Node {
    const variable = this.visitVar(assign.variable);
    let value;
    switch (assign.value.type) {
      case "bin_op":
        value = this.visitBinOp(assign.value);
        break;
      case "num":
        value = this.visitNum(assign.value);
        break;
      case "unary_op":
        value = this.visitUnaryOp(assign.value);
        break;
      default:
        value = this.visitVar(assign.value);
    }
    return new Node({
      name: ":=",
      children: Immutable.List([variable, value]),
      startPos: assign.startPos,
      stopPos: assign.stopPos,
    });
  }

  visitBinOp(binOp: BinOp): Node {
    let left: Node;
    switch (binOp.left.type) {
      case "bin_op":
        left = this.visitBinOp(binOp.left);
        break;
      case "num":
        left = this.visitNum(binOp.left);
        break;
      case "unary_op":
        left = this.visitUnaryOp(binOp.left);
        break;
      default:
        left = this.visitVar(binOp.left);
    }
    let right: Node;
    switch (binOp.right.type) {
      case "bin_op":
        right = this.visitBinOp(binOp.right);
        break;
      case "num":
        right = this.visitNum(binOp.right);
        break;
      case "unary_op":
        right = this.visitUnaryOp(binOp.right);
        break;
      default:
        right = this.visitVar(binOp.right);
    }
    return new Node({
      name: "BinOp:" + binOp.op.type,
      children: Immutable.List([left, right]),
      startPos: binOp.startPos,
      stopPos: binOp.stopPos,
    });
  }

  visitBlock(block: Block): Node {
    const declarations = Immutable.List(block.declarations).map(declaration =>
      this.visitVarDecl(declaration),
    );
    const compoundStatement = this.visitCompound(block.compoundStatement);
    return new Node({
      name: "Block",
      children: declarations.push(compoundStatement),
      startPos: block.startPos,
      stopPos: block.stopPos,
    });
  }

  visitCompound(compound: Compound): Node {
    const childNodes = compound.children.map(child => {
      switch (child.type) {
        case "compound":
          return this.visitCompound(child);
        case "assign":
          return this.visitAssign(child);
        default:
          return this.visitNoOp(child);
      }
    });
    return new Node({
      name: "Compound",
      children: Immutable.List(childNodes),
      startPos: childNodes[0].startPos,
      stopPos: childNodes[childNodes.length - 1].stopPos,
    });
  }

  visitNoOp(noOp: NoOp): Node {
    return new Node({
      name: "NoOp",
      startPos: noOp.startPos,
      stopPos: noOp.stopPos,
    });
  }

  visitNum(num: Num) {
    return new Node({
      name: "Num: " + num.token.value,
      startPos: num.startPos,
      stopPos: num.stopPos,
    });
  }

  visitProgram(program: Program) {
    return new Node({
      name: "Program: " + program.name,
      children: Immutable.List([this.visitBlock(program.block)]),
      startPos: program.startPos,
      stopPos: program.stopPos,
    });
  }

  visitType(type: Type) {
    return new Node({
      name: "Type: " + type.value,
      startPos: type.startPos,
      stopPos: type.stopPos,
    });
  }

  visitUnaryOp(unaryOp: UnaryOp): Node {
    let expr: Node;
    switch (unaryOp.expr.type) {
      case "bin_op":
        expr = this.visitBinOp(unaryOp.expr);
        break;
      case "num":
        expr = this.visitNum(unaryOp.expr);
        break;
      case "unary_op":
        expr = this.visitUnaryOp(unaryOp.expr);
        break;
      default:
        expr = this.visitVar(unaryOp.expr);
    }
    return new Node({
      name: "UnaryOp:" + unaryOp.op.type,
      children: Immutable.List([expr]),
      startPos: unaryOp.startPos,
      stopPos: unaryOp.stopPos,
    });
  }

  visitVar(node: Var) {
    return new Node({
      name: "Var: " + node.token.name,
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitVarDecl(varDecl: VarDecl): Node {
    return new Node({
      name: "VarDecl",
      children: Immutable.List([
        this.visitVar(varDecl.varNode),
        this.visitType(varDecl.typeNode),
      ]),
      startPos: varDecl.startPos,
      stopPos: varDecl.stopPos,
    });
  }
}

export { Node };
export default Stratifier;
