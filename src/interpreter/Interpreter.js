/* @flow */
import ExtendableError from "es6-error";
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  UnaryOp,
  NoOp,
  ProcedureCall,
  ProcedureDecl,
  Program,
  Num,
  Type,
  Var,
  VarDecl,
} from "./Parser";
import type { Token } from "./Token";

export class InterpreterError extends ExtendableError {}

class ImpossibleToken extends InterpreterError {
  constructor(token: Token, allowed: ?(string | Array<string>)) {
    let msg = 'Impossible token "' + token.type + ".";
    if (allowed != null) {
      if (typeof allowed === "string") {
        msg += ', only "' + allowed + '" allowed.';
      } else if (Array.isArray(allowed) && allowed.length === 1) {
        msg += token.type + 'only "' + allowed[0] + '" allowed.';
      } else {
        msg +=
          token.type +
          '", only "' +
          allowed.slice(0, -1).join(", ") +
          ", or " +
          allowed[-1] +
          " allowed";
      }
    }
    super(msg);
  }
}

class NameError extends InterpreterError {
  constructor(name: string) {
    super('"' + name + '" not found in scope.');
  }
}

class Interpreter {
  program: Program;
  globalScope: Map<string, number>;

  constructor(program: Program) {
    this.program = program;
    this.globalScope = new Map();
  }

  visitAssign(assign: Assign) {
    if (assign.variable.token.type === "ID") {
      const varName = assign.variable.token.value;
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
      if (typeof value === "number") {
        this.globalScope.set(varName, value);
      } else {
        throw new InterpreterError("Expected number.");
      }
    } else {
      throw new ImpossibleToken(assign.variable.token);
    }
  }

  visitBinOp(binOp: BinOp) {
    let left;
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
    let right;
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

    switch (binOp.op.type) {
      case "PLUS":
        return left + right;
      case "MINUS":
        return left - right;
      case "MUL":
        return left * right;
      case "INTEGER_DIV":
        return Math.floor(left / right);
      default:
        // FLOAT_DIV
        return left / right;
    }
  }

  visitBlock(block: Block) {
    block.declarations.forEach(declaration => {
      if (declaration.type === "var_decl") {
        return this.visitVarDecl(declaration);
      } else {
        return this.visitProcedureDecl(declaration);
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

  visitNoOp(noOp: NoOp) {}

  visitNum(num: Num): number {
    return num.token.value;
  }

  visitProcedureCall(procedureCall: ProcedureCall) {}

  visitProcedureDecl(procedureDecl: ProcedureDecl) {}

  visitProgram(program: Program) {
    this.visitBlock(program.block);
  }

  visitType(type: Type) {}

  visitUnaryOp(unaryOp: UnaryOp) {
    let expr;
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
    switch (unaryOp.op.type) {
      case "PLUS":
        return expr;
      default:
        // MINU
        return -expr;
    }
  }

  visitVar(var_: Var): number {
    const varName = var_.token.value;
    const val = this.globalScope.get(varName);
    if (val !== undefined && val !== null) {
      return val;
    } else {
      throw new NameError(varName);
    }
  }

  visitVarDecl(varDecl: VarDecl) {}

  interpret(): string {
    try {
      this.visitProgram(this.program);
      return "";
    } catch (e) {
      if (e instanceof NameError) {
        return e.message;
      } else {
        throw e;
      }
    }
  }
}

export default Interpreter;
