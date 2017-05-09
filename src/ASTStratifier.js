import ExtendableError from "es6-error";
import type {
  ASTNode,
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

class StratifierError extends ExtendableError {}

const Node = Immutable.Record(
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

class Stratifier {
  ast: Program;

  constructor(ast: Program) {
    this.ast = ast;
  }

  build() {
    return this.visit(this.ast);
  }

  visit(node: ASTNode): Node {
    switch (node.type) {
      case "assign":
        return this.visitAssign(node);
      case "block":
        return this.visitBlock(node);
      case "compound":
        return this.visitCompound(node);
      case "bin_op":
        return this.visitBinOp(node);
      case "unary_op":
        return this.visitUnaryOp(node);
      case "no_op":
        return this.visitNoOp(node);
      case "num":
        return this.visitNum(node);
      case "program":
        return this.visitProgram(node);
      case "type":
        return this.visitType(node);
      case "var":
        return this.visitVar(node);
      case "var_decl":
        return this.visitVarDecl(node);
      default:
        throw new StratifierError("No visit method for " + node.type + ".");
    }
  }

  visitAssign(node: Assign): Node {
    const variable = this.visit(node.variable);
    const value = this.visit(node.variable);
    return new Node({
      name: ":=",
      children: Immutable.List([variable, value]),
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitBlock(block: Block): Node {
    const declarations = Immutable.List(block.declarations).map(declaration =>
      this.visit(declaration),
    );
    const compoundStatement = this.visit(block.compoundStatement);
    return new Node({
      name: "Block",
      children: declarations.push(compoundStatement),
      startPos: block.startPos,
      stopPos: block.stopPos,
    });
  }

  visitBinOp(node: BinOp): Node {
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    return new Node({
      name: "BinOp:" + node.op.type,
      children: Immutable.List([left, right]),
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitCompound(node: Compound): Node {
    const childNodes = node.children.map(child => this.visit(child));
    return new Node({
      name: "Compound",
      children: Immutable.List(childNodes),
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitNoOp(node: NoOp): Node {
    return new Node({
      name: "NoOp",
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitNum(node: Num) {
    return new Node({
      name: "Num: " + node.token.value,
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitProgram(program: Program) {
    return new Node({
      name: "Program: " + program.name,
      children: Immutable.List([this.visit(program.block)]),
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

  visitUnaryOp(node: UnaryOp): Node {
    const expr = this.visit(node.expr);
    return new Node({
      name: "UnaryOp:" + node.op.type,
      children: Immutable.List([expr]),
      startPos: node.startPos,
      stopPos: node.stopPos,
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
        this.visit(varDecl.varNode),
        this.visit(varDecl.typeNode),
      ]),
      startPos: varDecl.startPos,
      stopPos: varDecl.stopPos,
    });
  }
}

export { Node };
export default Stratifier;
