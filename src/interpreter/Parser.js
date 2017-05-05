/* @flow */
import Lexer from "./Lexer";
import type { Token } from "./Token";

export type BinOp = {|
  type: "bin_op",
  left: Token,
  op: Token,
  right: Token,
|};
export type UnaryOp = {|
  type: "unary_op",
  op: Token,
  expr: AST,
|};
export type Num = {|
  type: "num",
  token: Token,
|};
export type AST = BinOp | UnaryOp | Num;

class Parser {
  lexer: Lexer;

  currentToken: Token;
  parse: Function;

  grammar = [
    "expr   : term ((PLUS | MINUS) term)*",
    "term   : factor ((MUL | DIV) factor)*",
    "factor : (PLUS | MINUS) factor | INTEGER | LPAREN expr RPAREN",
  ];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
  }

  eat(tokenType: string) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      let errStr =
        'Expected "' + tokenType + '" but got "' + this.currentToken.type;
      if (typeof this.currentToken.value === "number") {
        errStr += ' with value "' + this.currentToken.value;
      }
      errStr += '".';
      throw new Error(errStr);
    }
  }

  /**
   * factor : (PLUS | MINUS) factor | INTEGER | LPAREN expr RPAREN
   */
  factor(): AST {
    const token = this.currentToken;
    if (token.type === "PLUS") {
      this.eat("PLUS");
      return {
        type: "unary_op",
        op: token,
        expr: this.factor(),
      };
    } else if (token.type === "MINUS") {
      this.eat("MINUS");
      return {
        type: "unary_op",
        op: token,
        expr: this.factor(),
      };
    } else if (token.type === "INTEGER") {
      this.eat("INTEGER");
      if (token.value && typeof token.value === "number") {
        return {
          type: "num",
          token: token,
        };
      } else {
        throw new Error("Invalid token (impossible state).");
      }
    } else {
      this.eat("LPAREN");
      const result = this.expr();
      this.eat("RPAREN");
      return result;
    }
  }

  /**
   * term : factor ((MUL | DIV) factor)*
   */
  term(): AST {
    let node = this.factor();
    while (
      this.currentToken.type === "MUL" ||
      this.currentToken.type === "DIV"
    ) {
      const op = this.currentToken;
      if (op.type === "MUL") {
        this.eat("MUL");
      } else {
        this.eat("DIV");
      }
      node = {
        type: "bin_op",
        left: node,
        op: op,
        right: this.factor(),
      };
    }
    return node;
  }

  /**
   * expr : term ((PLUS | MINUS) term)*
   */
  expr(): AST {
    let node = this.term();
    while (
      this.currentToken.type === "PLUS" ||
      this.currentToken.type === "MINUS"
    ) {
      const op = this.currentToken;
      if (op.type === "PLUS") {
        this.eat("PLUS");
      } else {
        this.eat("MINUS");
      }
      node = {
        type: "bin_op",
        left: node,
        op: op,
        right: this.term(),
      };
    }
    return node;
  }

  parse() {
    this.currentToken = this.lexer.getNextToken();
    return this.expr();
  }
}

export default Parser;
