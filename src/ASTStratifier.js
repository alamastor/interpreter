/* @flow */
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  NoOp,
  Num,
  ProcedureDecl,
  Program,
  Type,
  UnaryOp,
  Var,
  VarDecl,
} from "./interpreter/parser";
import * as Immutable from "immutable";
import uuidV4 from "uuid/v4";

/* eslint-disable no-use-before-define */
const NodeBase = Immutable.Record(
  ({
    id: 0,
    name: "",
    children: new Immutable.List(),
    hiddenChildren: new Immutable.List(),
    startPos: 0,
    stopPos: 0,
  }: {|
    id: number,
    name: string,
    children: Immutable.List<Node>,
    hiddenChildren: Immutable.List<Node>,
    startPos: number,
    stopPos: number,
  |}),
);

const Node = class extends NodeBase {
  constructor(
    values:
      | {
          id?: number,
          name?: string,
          children?: Immutable.List<Node>,
          hiddenChildren?: Immutable.List<Node>,
          startPos?: number,
          stopPos?: number,
        }
      | {
          id: number,
          name: string,
          children: Immutable.List<Node>,
          hiddenChildren: Immutable.List<Node>,
          startPos: number,
          stopPos: number,
        },
  ) {
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
/* eslint-enable no-use-before-define */

class Stratifier {
  ast: ?Program;
  root: Node;

  constructor(ast: ?Program) {
    this.ast = ast;
  }

  build() {
    if (this.ast) {
      const root = this.visitProgram(this.ast);
      this.root = root;
      return root;
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
      id: uuidV4(),
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
      id: uuidV4(),
      name: "BinOp:" + binOp.op.type,
      children: Immutable.List([left, right]),
      startPos: binOp.startPos,
      stopPos: binOp.stopPos,
    });
  }

  visitBlock(block: Block): Node {
    const declarations = Immutable.List(block.declarations).map(declaration => {
      if (declaration.type === "var_decl") {
        return this.visitVarDecl(declaration);
      } else {
        return this.visitProcedureDecl(declaration);
      }
    });
    const compoundStatement = this.visitCompound(block.compoundStatement);
    return new Node({
      id: uuidV4(),
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
      id: uuidV4(),
      name: "Compound",
      children: Immutable.List(childNodes),
      startPos: childNodes[0].startPos,
      stopPos: childNodes[childNodes.length - 1].stopPos,
    });
  }

  visitNoOp(noOp: NoOp): Node {
    return new Node({
      id: uuidV4(),
      name: "NoOp",
      startPos: noOp.startPos,
      stopPos: noOp.stopPos,
    });
  }

  visitNum(num: Num) {
    return new Node({
      id: uuidV4(),
      name: "Num: " + num.token.value,
      startPos: num.startPos,
      stopPos: num.stopPos,
    });
  }

  visitProcedureDecl(procedureDecl: ProcedureDecl) {
    const params = procedureDecl.params.map(
      param =>
        new Node({
          id: uuidV4(),
          name: "Param",
          children: Immutable.List([
            this.visitVar(param.varNode),
            this.visitType(param.typeNode),
          ]),
          startPos: param.startPos,
          stopPos: param.stopPos,
        }),
    );

    const block = this.visitBlock(procedureDecl.block);

    return new Node({
      id: uuidV4(),
      name: "ProcedureDecl: " + procedureDecl.name,
      children: Immutable.List(params.concat(block)),
      startPos: procedureDecl.startPos,
      stopPos: procedureDecl.stopPos,
    });
  }

  visitProgram(program: Program): Node {
    return new Node({
      id: uuidV4(),
      name: "Program: " + program.name,
      children: Immutable.List([this.visitBlock(program.block)]),
      startPos: program.startPos,
      stopPos: program.stopPos,
    });
  }

  visitType(type: Type) {
    return new Node({
      id: uuidV4(),
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
      id: uuidV4(),
      name: "UnaryOp:" + unaryOp.op.type,
      children: Immutable.List([expr]),
      startPos: unaryOp.startPos,
      stopPos: unaryOp.stopPos,
    });
  }

  visitVar(node: Var) {
    return new Node({
      id: uuidV4(),
      name: "Var: " + node.token.name,
      startPos: node.startPos,
      stopPos: node.stopPos,
    });
  }

  visitVarDecl(varDecl: VarDecl): Node {
    return new Node({
      id: uuidV4(),
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
