/* @flow */
import ExtendableError from "es6-error";
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  NoOp,
  Num,
  ProcedureCall,
  ProcedureDecl,
  Program,
  UnaryOp,
  Var,
  VarDecl,
} from "./Parser";
import ScopedSymbolTable from "./ScopedSymbolTable";
import type { ProcedureSymbol, VarSymbol } from "./ASTSymbol";

export class SemanticError extends ExtendableError {}

export default class SemanticAnalyzer {
  currentScope: ScopedSymbolTable;

  constructor() {
    this.currentScope = new ScopedSymbolTable("empty", 0);
  }

  check(program: Program): ?string {
    try {
      this.visitProgram(program);
    } catch (e) {
      if (e instanceof SemanticError) {
        return "Semantic Error: " + e.message;
      } else {
        throw e;
      }
    }
  }

  visitAssign(assign: Assign) {
    const varSymbol = this.currentScope.lookup(assign.variable.name);
    if (varSymbol == null) {
      throw new SemanticError(assign.variable.name + " not found in scope.");
    }
    this.visitExpr(assign.value);
  }

  visitBinOp(binOp: BinOp) {
    this.visitExpr(binOp.left);
    this.visitExpr(binOp.right);
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
        case "procedure_call":
          this.visitProcedureCall(child);
          break;
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

  visitExpr(expr: BinOp | Num | UnaryOp | Var) {
    switch (expr.type) {
      case "bin_op":
        this.visitBinOp(expr);
        break;
      case "num":
        this.visitNum(expr);
        break;
      case "unary_op":
        this.visitUnaryOp(expr);
        break;
      default:
        // var case
        this.visitVar(expr);
    }
  }

  visitNoOp(noOp: NoOp) {}

  visitNum(num: Num) {}

  visitProcedureCall(procedureCall: ProcedureCall) {
    const procedureSymbol = this.currentScope.lookup(procedureCall.name);
    if (!procedureSymbol) {
      throw new SemanticError(procedureCall.name + " not found in scope.");
    } else if (procedureSymbol.symbolType !== "procedure") {
      throw new SemanticError(
        "Expected " +
          procedureCall.name +
          " to be type procedure but it is " +
          procedureSymbol.symbolType +
          ".",
      );
    }
    if (procedureCall.params.length !== procedureSymbol.params.length) {
      throw new SemanticError(
        "Wrong number of params to " +
          procedureCall.name +
          ", expected " +
          procedureSymbol.params.length +
          " got " +
          procedureCall.params.length +
          ".",
      );
    }

    procedureCall.params.forEach(param => this.visitExpr(param));
  }

  visitProcedureDecl(procedureDecl: ProcedureDecl) {
    const procName = procedureDecl.name;
    const procSymbol: ProcedureSymbol = {
      symbolType: "procedure",
      name: procName,
      params: [],
    };
    this.currentScope.insert(procSymbol);

    const procedureScope = new ScopedSymbolTable(
      procName,
      2,
      this.currentScope,
    );
    this.currentScope = procedureScope;

    procedureDecl.params.forEach(param => {
      const paramType = this.currentScope.lookup(param.typeNode.value);
      if (!paramType) {
        throw new SemanticError(param.typeNode.value + " not found in scope.");
      } else if (paramType.symbolType !== "builtin_type") {
        throw new SemanticError(
          "Expected built in type, got : " + paramType.symbolType,
        );
      } else {
        const paramName = param.varNode.name;
        const varSymbol: VarSymbol = {
          symbolType: "var",
          name: paramName,
          type: paramType,
        };
        this.currentScope.insert(varSymbol);
        procSymbol.params.push(varSymbol);
      }
    });

    this.visitBlock(procedureDecl.block);

    if (this.currentScope.enclosingScope) {
      this.currentScope = this.currentScope.enclosingScope;
    }
  }

  visitProgram(program: Program) {
    const globalScope = new ScopedSymbolTable("global", 1);
    this.currentScope = globalScope;
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
    const varSymbol = this.currentScope.lookup(varName);

    if (!varSymbol) {
      throw new SemanticError(variable.name + " not found in scope.");
    }
  }

  visitVarDecl(varDecl: VarDecl) {
    const typeName = varDecl.typeNode.value;
    const typeSymbol = this.currentScope.lookup(typeName);
    if (!typeSymbol || typeSymbol.symbolType !== "builtin_type") {
      throw new SemanticError("Expected type");
    }
    const varName = varDecl.varNode.name;
    const varSymbol = { symbolType: "var", name: varName, type: typeSymbol };

    if (this.currentScope.lookup(varName, true) !== undefined) {
      throw new SemanticError("Duplicate declaration : " + varName);
    }

    this.currentScope.insert(varSymbol);
  }
}
