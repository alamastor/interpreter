/* @flow */
import ExtendableError from "es6-error";
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  NoOp,
  Num,
  ProcedureDecl,
  Program,
  UnaryOp,
  Var,
  VarDecl,
} from "./Parser";
import SymbolTable from "./SymbolTable";

export class SemanticError extends ExtendableError {}

export default class SymbolTableBuilder {
  table: SymbolTable;

  constructor() {
    this.table = new SymbolTable();
  }

  visitAssign(assign: Assign) {
    const varName = assign.variable.name;
    const varSymbol = this.table.lookup(varName);
    if (!varSymbol) {
      throw new SemanticError(varName);
    }

    switch (assign.value.type) {
      case "bin_op":
        this.visitBinOp(assign.value);
        break;
      case "num":
        this.visitNum(assign.value);
        break;
      case "unary_op":
        this.visitUnaryOp(assign.value);
        break;
      default:
        // var case
        this.visitVar(assign.value);
    }
  }

  visitBinOp(binOp: BinOp) {
    switch (binOp.left.type) {
      case "bin_op":
        this.visitBinOp(binOp.left);
        break;
      case "num":
        this.visitNum(binOp.left);
        break;
      case "unary_op":
        this.visitUnaryOp(binOp.left);
        break;
      default:
        // var case
        this.visitVar(binOp.left);
    }

    switch (binOp.right.type) {
      case "bin_op":
        this.visitBinOp(binOp.right);
        break;
      case "num":
        this.visitNum(binOp.right);
        break;
      case "unary_op":
        this.visitUnaryOp(binOp.right);
        break;
      default:
        // var case
        this.visitVar(binOp.right);
    }
  }

  visitBlock(block: Block) {
    block.declarations.forEach(node => {
      if (node.type === "var_decl") {
        return this.visitVarDecl(node);
      } else {
        return this.visitProcedureDecl(node);
      }
    });
    this.visitCompound(block.compoundStatement);
  }

  visitCompound(compound: Compound) {
    compound.children.forEach(child => {
      switch (child.type) {
        case "compound":
          this.visitCompound(child);
          break;
        case "assign":
          this.visitAssign(child);
          break;
        default:
          this.visitNoOp(child);
      }
    });
  }

  visitNoOp(noOp: NoOp) {}

  visitNum(num: Num) {}

  visitProcedureDecl(procedureDecl: ProcedureDecl) {}

  visitProgram(program: Program) {
    this.visitBlock(program.block);
  }

  visitUnaryOp(unaryOp: UnaryOp) {
    switch (unaryOp.expr.type) {
      case "bin_op":
        this.visitBinOp(unaryOp.expr);
        break;
      case "num":
        this.visitNum(unaryOp.expr);
        break;
      case "unary_op":
        this.visitUnaryOp(unaryOp.expr);
        break;
      default:
        // var case
        this.visitVar(unaryOp.expr);
    }
  }

  visitVar(variable: Var) {
    const varName = variable.name;
    const varSymbol = this.table.lookup(varName);

    if (!varSymbol) {
      throw new SemanticError(varName);
    }
  }

  visitVarDecl(varDecl: VarDecl) {
    const typeName = varDecl.typeNode.value;
    const typeSymbol = this.table.lookup(typeName);
    if (!typeSymbol || typeSymbol.symbolType !== "builtin_type") {
      throw new SemanticError("Expected type");
    }
    const varName = varDecl.varNode.name;
    const varSymbol = { symbolType: "var", name: varName, type: typeSymbol };

    if (this.table.lookup(varName) !== undefined) {
      throw new SemanticError("Duplicate declaration : " + varName);
    }

    this.table.define(varSymbol);
  }
}
