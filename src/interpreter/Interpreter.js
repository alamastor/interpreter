import ExtendableError from "es6-error";
import { UnexpectedChar } from "./Lexer";
import Parser, { UnexpectedToken } from "./Parser";
import type {
  ASTNode,
  Assign,
  BinOp,
  Block,
  Compound,
  UnaryOp,
  NoOp,
  Program,
  Num,
  Type,
  Var,
  VarDecl,
} from "./Parser";
import type { Token } from "./Token";

class InterpreterError extends ExtendableError {}

class ImpossibleToken extends InterpreterError {
  constructor(token: Token, allowed: ?(string | Array<string>)) {
    let msg = 'Impossible token "' + token.type + ".";
    if (allowed) {
      if (typeof allowed === "string") {
        msg += ', only "' + allowed + '" allowed.';
      } else if (allowed.length === 1) {
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

class NoVisitMethod extends InterpreterError {
  constructor(node: ASTNode) {
    super('No visit method for "' + node.type + '".');
  }
}

class NameError extends InterpreterError {
  constructor(name: string) {
    super('"' + name + '" not found in scope.');
  }
}

class Interpreter {
  parser: Parser;
  globalScope: Map<string, number>;

  constructor(parser: Parser) {
    this.parser = parser;
    this.globalScope = new Map();
  }

  visit(node: ASTNode) {
    switch (node.type) {
      case "assign":
        return this.visitAssign(node);
      case "bin_op":
        return this.visitBinOp(node);
      case "block":
        return this.visitBlock(node);
      case "compound":
        return this.visitCompound(node);
      case "no_op":
        return this.visitNoOp(node);
      case "num":
        return this.visitNum(node);
      case "program":
        return this.visitProgram(node);
      case "type":
        return this.visitType(node);
      case "unary_op":
        return this.visitUnaryOp(node);
      case "var":
        return this.visitVar(node);
      case "var_decl":
        return this.visitVarDecl(node);
      default:
        throw new NoVisitMethod(node);
    }
  }

  visitAssign(node: Assign) {
    if (node.variable.token.type === "ID") {
      const varName = node.variable.token.name;
      const value = this.visit(node.value);
      if (typeof value === "number") {
        this.globalScope.set(varName, value);
      } else {
        throw new InterpreterError("Expected number.");
      }
    } else {
      throw new ImpossibleToken(node.variable.token);
    }
  }

  visitBinOp(node: BinOp) {
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    // Remove me when typing fixed
    if (typeof left === "number" && typeof right === "number") {
      switch (node.op.type) {
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
          throw new ImpossibleToken(node.op, ["PLUS", "MINUS", "MUL", "DIV"]);
      }
    } else {
      throw new InterpreterError("Expected number.");
    }
  }

  visitBlock(block: Block) {
    block.declarations.forEach(declartation => {
      this.visit(declartation);
    });
    this.visit(block.compoundStatement);
  }

  visitCompound(node: Compound) {
    node.children.forEach(node => {
      this.visit(node);
    });
  }

  visitNoOp(node: NoOp) {}

  visitNum(node: Num): number {
    if (
      node.token.type === "INTEGER_CONST" ||
      node.token.type == "REAL_CONST"
    ) {
      return node.token.value;
    } else {
      throw new ImpossibleToken(node.token, ["INTEGER_CONST", "REAL_CONST"]);
    }
  }

  visitProgram(program: Program) {
    this.visit(program.block);
  }

  visitType(type: Type) {}

  visitUnaryOp(node: UnaryOp) {
    const expr = this.visit(node.expr);
    if (typeof expr === "number") {
      switch (node.op.type) {
        case "PLUS":
          return expr;
        case "MINUS":
          return -expr;
        default:
          throw new ImpossibleToken(node.op, ["PLUS", "MINUS"]);
      }
    } else {
      throw new InterpreterError("expected number");
    }
  }

  visitVar(node: Var): number {
    if (node.token.type === "ID") {
      const varName = node.token.name;
      const val = this.globalScope.get(varName);
      if (val) {
        return val;
      } else {
        throw NameError(varName);
      }
    } else {
      throw new ImpossibleToken(node.token, "ID");
    }
  }

  visitVarDecl(varDecl: VarDecl) {}

  interpret() {
    try {
      const tree = this.parser.parse();
      this.visit(tree);
    } catch (e) {
      if (e instanceof UnexpectedChar) {
        return "Lexer Error: " + e.message;
      }
      if (e instanceof UnexpectedToken) {
        return "Parser Error: " + e.message;
      }
      if (e instanceof InterpreterError) {
        return "Interpreter Error: " + e.message;
      }
      throw e;
    }
  }
}

export default Interpreter;
