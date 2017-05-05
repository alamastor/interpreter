/* @flow */
import Lexer from "./Lexer";
import type { Token } from "./Token";

type AST =
  | {
      type: "bin_op",
      left: Token,
      op: Token,
      right: Token
    }
  | {
      type: "num",
      token: Token
    };

class Parser {
  lexer: Lexer;

  currentToken: Token;
  parse: Function;

  grammar = [
    "expr   : term ((PLUS | MINUS) term)*",
    "term   : factor ((MUL | DIV) factor)*",
    "factor : INTEGER | LPAREN expr RPAREN"
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
   * factor : INTEGER | LPAREN expr RPAREN
   */
  factor(): AST {
    const token = this.currentToken;
    if (token.type === "INTEGER") {
      this.eat("INTEGER");
      if (token.value && typeof token.value === "number") {
        return {
          type: "num",
          token: token
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
        right: this.factor()
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
        right: this.term()
      };
    }
    return node;
  }

  parse() {
    this.currentToken = this.lexer.getNextToken();
    return this.expr();
  }
}

export type { AST };
export default Parser;
