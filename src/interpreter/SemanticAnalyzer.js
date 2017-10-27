/* @flow */
import ExtendableError from "es6-error";
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  Expr,
  NoOp,
  Num,
  ProcedureCall,
  ProcedureDecl,
  Program,
  UnaryOp,
  Var,
  VarDecl,
  WriteStream,
} from "./Parser";
import ScopedSymbolTable from "./ScopedSymbolTable";
import type {
  ProcedureSymbol,
  VarSymbol,
  BuiltinTypeSymbol,
} from "./ASTSymbol";
import _ from "lodash";
import { write } from "./builtins";

export class SemanticError extends ExtendableError {}

export default class SemanticAnalyzer {
  currentScope: ScopedSymbolTable;

  constructor() {
    this.currentScope = new ScopedSymbolTable("empty", 0);
    this.initBuiltins();
  }

  initBuiltins() {
    this.visitProcedureDecl(write);
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
    const varSymbol = this.currentScope.lookupVar(assign.variable.name);
    if (varSymbol == null) {
      throw new SemanticError(assign.variable.name + " not found in scope.");
    }
    const exprType = this.visitExpr(assign.value);
    if (varSymbol.type.name !== exprType.name) {
      if (varSymbol.type.name !== "REAL" && exprType.name !== "INTEGER") {
        throw new SemanticError(
          "Can't assign type " +
            exprType.name +
            " to var '" +
            varSymbol.name +
            "' which has type " +
            varSymbol.type.name +
            ".",
        );
      }
    }
  }

  visitBinOp(binOp: BinOp): BuiltinTypeSymbol {
    const left = this.visitExpr(binOp.left);
    const right = this.visitExpr(binOp.right);
    switch (binOp.op.type) {
      case "PLUS":
        return this.intRealMixedOp("add", left, right);
      case "MINUS":
        return this.intRealMixedOp("subract", left, right);
      case "MUL":
        return this.intRealMixedOp("multiply", left, right);
      case "FLOAT_DIV":
        return this.intRealMixedOp("divide", left, right);
      case "INTEGER_DIV":
        if (left.name === "INTEGER" && right.name === "INTEGER") {
          return left;
        } else {
          throw new SemanticError(
            "Can't integer divide types " +
              left.name +
              " and " +
              right.name +
              ".",
          );
        }
      default:
        /* eslint-disable no-unused-expressions */
        (binOp.op.type: empty); // Won't type check if new case added!
        /* eslint-enable no-unused-expressions */
        throw new Error("Impossible state");
    }
  }

  intRealMixedOp(
    opName: string,
    left: BuiltinTypeSymbol,
    right: BuiltinTypeSymbol,
  ): BuiltinTypeSymbol {
    if (
      (left.name === "INTEGER" && right.name === "INTEGER") ||
      (left.name === "REAL" && right.name === "REAL")
    ) {
      return left;
    } else if (
      (left.name === "INTEGER" && right.name === "REAL") ||
      (left.name === "REAL" && right.name === "INTEGER")
    ) {
      return {
        symbolType: "builtin_type",
        name: "REAL",
      };
    } else {
      throw new SemanticError(
        "Can't " + opName + " types " + left.name + " and " + right.name + ".",
      );
    }
  }

  visitBlock(block: Block) {
    block.declarations.forEach(node => {
      switch (node.type) {
        case "var_decl":
          return this.visitVarDecl(node);
        case "procedure_decl":
          return this.visitProcedureDecl(node);
        default:
          /* eslint-disable no-unused-expressions */
          (node.type: empty); // Won't type check if new case added!
          /* eslint-enable no-unused-expressions */
          throw new Error("Impossible state");
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
        case "no_op":
          this.visitNoOp(child);
          break;
        case "write_stream":
          this.visitWriteStream(child);
          break;
        default:
          /* eslint-disable no-unused-expressions */
          (child.type: empty); // Won't type check if new case added!
          /* eslint-enable no-unused-expressions */
          throw new Error("Impossible state");
      }
    });
  }

  visitExpr(expr: Expr): BuiltinTypeSymbol {
    switch (expr.type) {
      case "bin_op":
        return this.visitBinOp(expr);
      case "num":
        return this.visitNum(expr);
      case "unary_op":
        return this.visitUnaryOp(expr);
      case "var":
        return this.visitVar(expr);
      default:
        /* eslint-disable no-unused-expressions */
        (expr.type: empty); // Won't type check if new case added!
        /* eslint-enable no-unused-expressions */
        throw new Error("Impossible state");
    }
  }

  visitNoOp(noOp: NoOp) {}

  visitNum(num: Num): BuiltinTypeSymbol {
    switch (num.token.type) {
      case "INTEGER_CONST":
        return { symbolType: "builtin_type", name: "INTEGER" };
      case "REAL_CONST":
        return { symbolType: "builtin_type", name: "REAL" };
      default:
        /* eslint-disable no-unused-expressions */
        (num.token.type: empty); // Won't type check if new case added!
        /* eslint-enable no-unused-expressions */
        throw new Error("Impossible state");
    }
  }

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

    const expectedAndGotParams = _.zip(
      procedureSymbol.params,
      procedureCall.params,
    );
    expectedAndGotParams.forEach(([expected, got]) => {
      const expectedType = expected.type.name;
      const gotType = this.visitExpr(got).name;
      if (
        expectedType !== gotType &&
        (expectedType !== "REAL" && gotType !== "INTEGER")
      ) {
        throw new SemanticError(
          "Wrong param type to " +
            procedureSymbol.name +
            " param " +
            expected.name +
            ", expected " +
            expectedType +
            " got " +
            gotType +
            ".",
        );
      }
    });
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
    const globalScope = new ScopedSymbolTable(
      "global",
      this.currentScope.scopeLevel + 1,
      this.currentScope,
    );
    this.currentScope = globalScope;
    this.visitBlock(program.block);
    if (this.currentScope.enclosingScope) {
      this.currentScope = this.currentScope.enclosingScope;
    }
  }

  visitUnaryOp(unaryOp: UnaryOp): BuiltinTypeSymbol {
    return this.visitExpr(unaryOp.expr);
  }

  visitVar(variable: Var): BuiltinTypeSymbol {
    const varName = variable.name;
    const varSymbol = this.currentScope.lookupVar(varName);

    if (!varSymbol) {
      throw new SemanticError(variable.name + " not found in scope.");
    }
    return varSymbol.type;
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

  visitWriteStream(writeStream: WriteStream) {}
}
