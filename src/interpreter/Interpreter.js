/* @flow */
import ExtendableError from "es6-error";
import type {
  Assign,
  BinOp,
  Block,
  Compound,
  Expr,
  UnaryOp,
  NoOp,
  Param,
  ProcedureCall,
  ProcedureDecl,
  Program,
  Num,
  Type,
  Var,
  VarDecl,
  WriteStream,
} from "./Parser";
import type { Token } from "./Token";
import ScopedNameSpace from "./ScopedNameSpace";
import _ from "lodash";
import { write } from "./builtins";

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
  currentScope: ScopedNameSpace;
  streams: {|
    STDOUT: string,
    STDERR: string,
  |};

  constructor(program: Program) {
    this.program = program;
    this.currentScope = new ScopedNameSpace(this.program.name, 0);
    this.streams = {
      STDOUT: "",
      STDERR: "",
    };
    this.initBuiltins();
  }

  initBuiltins() {
    this.currentScope.insertProcedure(write);
  }

  visitAssign(assign: Assign) {
    if (assign.variable.token.type === "ID") {
      const varName = assign.variable.token.value;
      const value = this.visitExpr(assign.value);
      if (typeof value === "number") {
        this.currentScope.insertValue(varName, value);
      } else {
        throw new InterpreterError("Expected number.");
      }
    } else {
      throw new ImpossibleToken(assign.variable.token);
    }
  }

  visitBinOp(binOp: BinOp) {
    const left = this.visitExpr(binOp.left);
    const right = this.visitExpr(binOp.right);

    switch (binOp.op.type) {
      case "PLUS":
        return left + right;
      case "MINUS":
        return left - right;
      case "MUL":
        return left * right;
      case "INTEGER_DIV":
        return Math.floor(left / right);
      case "FLOAT_DIV":
        return left / right;
      default:
        /* eslint-disable no-unused-expressions */
        (binOp.op.type: empty); // Won't type check if new case added!
        /* eslint-enable no-unused-expressions */
        throw new Error("Impossible state");
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

  visitExpr(expr: Expr): number {
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

  visitNoOp(noOp: NoOp) {}

  visitNum(num: Num): number {
    return num.token.value;
  }

  visitProcedureCall(procedureCall: ProcedureCall) {
    const proc = this.currentScope.lookUpProcedure(procedureCall.name);
    if (!proc) {
      throw new NameError(
        "Proc " + procedureCall.name + " not found in current scope.",
      );
    }
    this.currentScope = new ScopedNameSpace(
      procedureCall.name,
      this.currentScope.scopeLevel + 1,
      this.currentScope,
    );

    const nameValPairs: Array<[Param, Expr]> = _.zip(
      proc.params,
      procedureCall.params,
    );
    nameValPairs.forEach(pair => {
      this.currentScope.insertValue(
        pair[0].varNode.name,
        this.visitExpr(pair[1]),
      );
    });
    this.visitBlock(proc.block);
    if (this.currentScope.enclosingScope) {
      this.currentScope = this.currentScope.enclosingScope;
    }
  }

  visitProcedureDecl(procedureDecl: ProcedureDecl) {
    this.currentScope.insertProcedure(procedureDecl);
  }

  visitProgram(program: Program) {
    this.currentScope = new ScopedNameSpace(
      "global",
      this.currentScope.scopeLevel + 1,
      this.currentScope,
    );
    this.visitBlock(program.block);
    if (this.currentScope.enclosingScope) {
      this.currentScope = this.currentScope.enclosingScope;
    }
  }

  visitType(type: Type) {}

  visitUnaryOp(unaryOp: UnaryOp) {
    const expr = this.visitExpr(unaryOp.expr);
    switch (unaryOp.op.type) {
      case "PLUS":
        return expr;
      default:
        // MINUS
        return -expr;
    }
  }

  visitVar(var_: Var): number {
    const varName = var_.token.value;
    const val = this.currentScope.lookUpValue(varName);
    if (val !== undefined && val !== null) {
      return val;
    } else {
      throw new NameError(varName);
    }
  }

  visitVarDecl(varDecl: VarDecl) {}

  visitWriteStream(writeStream: WriteStream) {
    const value = this.currentScope.lookUpValue(writeStream.var.name);
    this.streams[writeStream.stream] += value;
  }

  interpret(): { STDOUT: string, STDERR: string } {
    try {
      this.visitProgram(this.program);
      return this.streams;
    } catch (e) {
      if (e instanceof NameError) {
        this.streams.STDOUT += "Name Error: " + e.message;
        return this.streams;
      } else {
        throw e;
      }
    }
  }
}

export default Interpreter;
