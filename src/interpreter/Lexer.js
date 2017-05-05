/* @flow */
import type { Token } from "./Token";
import ExtendableError from "es6-error";

const isSpace = (s: ?string) => s === " ";

const isDigit = (s: ?string) => !isNaN(parseInt(s, 10));

class UnexpectedChar extends ExtendableError {
  startPos: number;
  endPos: number;

  constructor(message: string, startPos: number, endPos: number) {
    super(message);
    this.startPos = startPos;
    this.endPos = endPos;
  }
}

class Lexer {
  text: string;
  pos: number;
  currentChar: ?string;

  constructor(text: string) {
    this.text = text;
    this.pos = 0;
    this.currentChar = this.text[this.pos];
  }

  advance() {
    this.pos++;
    if (this.pos > this.text.length - 1) {
      this.currentChar = null;
    } else {
      this.currentChar = this.text[this.pos];
    }
  }

  skipWhitespace() {
    while (this.currentChar !== null && isSpace(this.currentChar)) {
      this.advance();
    }
  }

  integer(): Token {
    let result = "";
    const startPos = this.pos;
    while (
      this.currentChar !== null &&
      isDigit(this.currentChar) &&
      typeof this.currentChar === "string"
    ) {
      result += this.currentChar;
      this.advance();
    }
    return {
      type: "INTEGER",
      value: parseInt(result, 10),
      startPos: startPos,
      endPos: this.pos,
    };
  }

  getNextToken(): Token {
    const text = this.text;

    while (this.currentChar) {
      const currentChar = text[this.pos];

      if (isSpace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (isDigit(currentChar)) {
        return this.integer();
      }

      if (currentChar === "+") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "PLUS",
          startPos: startPos,
          endPos: this.pos,
        };
      }

      if (currentChar === "-") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "MINUS",
          startPos: startPos,
          endPos: this.currentChar,
        };
      }

      if (currentChar === "*") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "MUL",
          startPos: startPos,
          endPos: this.pos,
        };
      }

      if (currentChar === "/") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "DIV",
          startPos: startPos,
          endPos: this.pos,
        };
      }

      if (currentChar === "(") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "LPAREN",
          startPos: startPos,
          endPos: this.pos,
        };
      }

      if (currentChar === ")") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "RPAREN",
          startPos: startPos,
          endPos: this.pos,
        };
      }

      const err = new UnexpectedChar(
        'Unrecognized character: "' + currentChar + '".',
        this.pos,
        this.pos + 1,
      );
      throw err;
    }
    return {
      type: "EOF",
      startPos: this.pos,
      endPos: this.pos + 1,
    };
  }
}

export { UnexpectedChar };
export default Lexer;
