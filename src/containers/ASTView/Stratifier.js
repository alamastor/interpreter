/* @flow */

import type {
  Assign,
  BinOp,
  Block,
  Compound,
  NoOp,
  Num,
  ProcedureDecl,
  ProcedureCall,
  Program,
  Type,
  UnaryOp,
  Var,
  VarDecl,
  WriteStream,
} from "../../interpreter/Parser";
import uuidV4 from "uuid/v4";

export type Node = {
  name: string,
  type: string,
  children?: Array<Node>,
  hiddenChildren?: Array<Node>,
  startPos: number,
  stopPos: number,
};

export const emptyStrata: Node = {
  name: "",
  type: "",
  startPos: 0,
  stopPos: 0,
};

class Stratifier {
  ast: Program;
  root: Node;

  constructor(ast: Program) {
    this.ast = ast;
  }

  build() {
    const root = this.visitProgram(this.ast);
    this.root = root;
    return root;
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
    return {
      name: ":=",
      type: "Assign",
      children: [variable, value],
      startPos: assign.startPos,
      stopPos: assign.stopPos,
    };
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
    return {
      name: "BinOp:" + binOp.op.type,
      type: "BinOp",
      children: [left, right],
      startPos: binOp.startPos,
      stopPos: binOp.stopPos,
    };
  }

  visitBlock(block: Block): Node {
    const declarations = block.declarations.map(declaration => {
      if (declaration.type === "var_decl") {
        return this.visitVarDecl(declaration);
      } else {
        return this.visitProcedureDecl(declaration);
      }
    });
    const compoundStatement: Node = this.visitCompound(block.compoundStatement);
    return {
      name: "Block",
      type: "Block",
      children: declarations.concat([compoundStatement]),
      startPos: block.startPos,
      stopPos: block.stopPos,
    };
  }

  visitCompound(compound: Compound): Node {
    const childNodes = compound.children.map(child => {
      switch (child.type) {
        case "procedure_call":
          return this.visitProcedureCall(child);
        case "compound":
          return this.visitCompound(child);
        case "assign":
          return this.visitAssign(child);
        case "no_op":
          return this.visitNoOp(child);
        case "write_stream":
          return this.visitWriteStream(child);
        default:
          /* eslint-disable no-unused-expressions */
          (child.type: empty); // Won't type check if new case added!
          /* eslint-enable no-unused-expressions */
          throw new Error("Impossible state");
      }
    });
    return {
      id: uuidV4(),
      name: "Compound",
      type: "Compound",
      children: childNodes,
      startPos: childNodes[0].startPos,
      stopPos: childNodes[childNodes.length - 1].stopPos,
    };
  }

  visitExpr(expr: BinOp | Num | UnaryOp | Var) {
    switch (expr.type) {
      case "bin_op":
        return this.visitBinOp(expr);
      case "num":
        return this.visitNum(expr);
      case "unary_op":
        return this.visitUnaryOp(expr);
      default:
        return this.visitVar(expr);
    }
  }

  visitNoOp(noOp: NoOp): Node {
    return {
      id: uuidV4(),
      name: "NoOp",
      type: "NoOp",
      startPos: noOp.startPos,
      stopPos: noOp.stopPos,
    };
  }

  visitNum(num: Num) {
    return {
      id: uuidV4(),
      name: "Num: " + num.token.value,
      type: "Num",
      startPos: num.startPos,
      stopPos: num.stopPos,
    };
  }

  visitProcedureCall(procedureCall: ProcedureCall): Node {
    const children = procedureCall.params.map(param => this.visitExpr(param));

    return {
      id: uuidV4(),
      name: "ProcCall: " + procedureCall.name,
      type: "ProcCall",
      children: children,
      startPos: procedureCall.startPos,
      stopPos: procedureCall.stopPos,
    };
  }

  visitProcedureDecl(procedureDecl: ProcedureDecl): Node {
    const params = procedureDecl.params.map(param => ({
      id: uuidV4(),
      name: "Param",
      type: "Param",
      children: [this.visitVar(param.varNode), this.visitType(param.typeNode)],
      startPos: param.startPos,
      stopPos: param.stopPos,
    }));

    const block = this.visitBlock(procedureDecl.block);

    return {
      id: uuidV4(),
      name: "ProcDecl: " + procedureDecl.name,
      type: "ProcDecl",
      children: params.concat(block),
      startPos: procedureDecl.startPos,
      stopPos: procedureDecl.stopPos,
    };
  }

  visitProgram(program: Program): Node {
    return {
      id: uuidV4(),
      name: "Program: " + program.name,
      type: "Program",
      children: [this.visitBlock(program.block)],
      startPos: program.startPos,
      stopPos: program.stopPos,
    };
  }

  visitType(type: Type) {
    return {
      id: uuidV4(),
      name: "Type: " + type.value,
      type: "Type",
      startPos: type.startPos,
      stopPos: type.stopPos,
    };
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
    return {
      id: uuidV4(),
      name: "UnaryOp:" + unaryOp.op.type,
      type: "UnaryOp",
      children: [expr],
      startPos: unaryOp.startPos,
      stopPos: unaryOp.stopPos,
    };
  }

  visitVar(node: Var): Node {
    return {
      id: uuidV4(),
      name: "Var: " + node.token.value,
      type: "Var",
      startPos: node.startPos,
      stopPos: node.stopPos,
    };
  }

  visitVarDecl(varDecl: VarDecl): Node {
    return {
      id: uuidV4(),
      name: "VarDecl",
      type: "VarDecl",
      children: [
        this.visitVar(varDecl.varNode),
        this.visitType(varDecl.typeNode),
      ],
      startPos: varDecl.startPos,
      stopPos: varDecl.stopPos,
    };
  }

  visitWriteStream(writeStream: WriteStream): Node {
    return {
      id: uuidV4(),
      name: "WriteStream",
      type: "WriteStream",
      startPos: writeStream.startPos,
      stopPos: writeStream.stopPos,
    };
  }
}

export default Stratifier;
