/* @flow */
import ExtendableError from "es6-error";
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  NoOp,
  Num,
  Program,
  UnaryOp,
  Var,
  VarDecl,
} from "./Parser";

type Symbol = BuiltinTypeSymbol | VarSymbol;

type BuiltinTypeSymbol = {|
  symbolType: "builtin_type",
  name: string,
|};

type VarSymbol = {|
  symbolType: "var",
  name: string,
  type: BuiltinTypeSymbol,
|};

class SymbolTableError extends ExtendableError {}

class SymbolTable {
  symbols: Map<string, Symbol>;

  constructor() {
    this.symbols = new Map();
    this.initBuiltins();
  }

  initBuiltins() {
    this.define({ symbolType: "builtin_type", name: "INTEGER" });
    this.define({ symbolType: "builtin_type", name: "REAL" });
  }

  define(symbol: Symbol) {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name: string) {
    return this.symbols.get(name);
  }
}

class NameError extends SymbolTable {}

class SymbolTableBuilder {
  table: SymbolTable;

  constructor() {
    this.table = new SymbolTable();
  }

  visitAssign(assign: Assign) {
    const varName = assign.variable.name;
    const varSymbol = this.table.lookup(varName);
    if (!varSymbol) {
      throw new NameError(varName);
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

  visitBlock(block: Block) {
    block.declarations.forEach(node => this.visitVarDecl(node));
    this.visitCompound(block.compoundStatement);
  }

  visitProgram(program: Program) {
    this.visitBlock(program.block);
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

  visitNum(num: Num) {}

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

  visitVar(variable: Var) {
    const varName = variable.name;
    const varSymbol = this.table.lookup(varName);

    if (!varSymbol) {
      throw new NameError(varName);
    }
  }

  visitVarDecl(varDecl: VarDecl) {
    const typeName = varDecl.typeNode.value;
    const typeSymbol = this.table.lookup(typeName);
    if (!typeSymbol || typeSymbol.symbolType !== "builtin_type") {
      throw new SymbolTableError("Expected type");
    }
    const varName = varDecl.varNode.name;
    const varSymbol = { symbolType: "var", name: varName, type: typeSymbol };
    this.table.define(varSymbol);
  }
}
