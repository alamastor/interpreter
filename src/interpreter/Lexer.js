/* @flow */
import ExtendableError from "es6-error";
import type { Token } from "./Token";

export interface LexerInterface {
  getNextToken(): Token,
}

const isSpace = (s: string) => s.match(/ |\n/);

const isDigit = (s: string) => !isNaN(parseInt(s, 10));

const isAlpha = (s: string) => {
  if (s.length !== 1) {
    throw new Error("Expected single char, got " + s);
  }
  return s.match(/[A-Z|a-z|_]/);
};

const isAlphaNum = (s: string) => {
  if (s.length !== 1) {
    throw new Error("Expected single char, got " + s);
  }
  return s.match(/[A-Z|a-z|0-9|_]/);
};

class UnexpectedChar extends ExtendableError {
  startPos: number;
  stopPos: number;

  constructor(char: string, startPos: number) {
    const msg = 'Unexpected char "' + char + '"';
    super(msg);
    this.startPos = startPos;
    this.stopPos = startPos + 1;
  }
}

class Lexer {
  text: string;
  pos: number;
  currentChar: string | null;

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

  skipComment() {
    while (this.currentChar !== "}") {
      this.advance();
    }
    this.advance();
  }

  peek(): ?string {
    const peekPos = this.pos + 1;
    if (peekPos > this.text.length + 1) {
      return null;
    } else {
      return this.text[peekPos];
    }
  }

  id() {
    let result = "";
    const startPos = this.pos;
    while (this.currentChar !== null && isAlphaNum(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    switch (result) {
      case "BEGIN":
        return {
          type: "BEGIN",
          startPos: startPos,
          stopPos: this.pos,
        };
      case "DIV":
        return {
          type: "INTEGER_DIV",
          startPos: startPos,
          stopPos: this.pos,
        };
      case "END":
        return {
          type: "END",
          startPos: startPos,
          stopPos: this.pos,
        };
      case "INTEGER":
        return {
          type: "INTEGER",
          startPos: startPos,
          stopPos: this.pos,
        };
      case "PROGRAM":
        return {
          type: "PROGRAM",
          startPos: startPos,
          stopPos: this.pos,
        };
      case "REAL":
        return {
          type: "REAL",
          startPos: startPos,
          stopPos: this.pos,
        };
      case "VAR":
        return {
          type: "VAR",
          startPos: startPos,
          stopPos: this.pos,
        };
      default:
        return {
          type: "ID",
          name: result,
          startPos: startPos,
          stopPos: this.pos,
        };
    }
  }

  number() {
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

    if (this.currentChar === ".") {
      result += this.currentChar;
      this.advance();
      while (
        this.currentChar !== null &&
        isDigit(this.currentChar) &&
        typeof this.currentChar === "string"
      ) {
        result += this.currentChar;
        this.advance();
      }
      return {
        type: "REAL_CONST",
        value: parseFloat(result),
        startPos: startPos,
        stopPos: this.pos,
      };
    }
    return {
      type: "INTEGER_CONST",
      value: parseInt(result, 10),
      startPos: startPos,
      stopPos: this.pos,
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

      if (this.currentChar === "{") {
        this.skipComment();
        continue;
      }

      if (isAlpha(currentChar)) {
        return this.id();
      }

      if (isDigit(currentChar)) {
        return this.number();
      }

      if (currentChar === ":" && this.peek() === "=") {
        const startPos = this.pos;
        this.advance();
        this.advance();
        return {
          type: "ASSIGN",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === ":") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "COLON",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === ",") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "COMMA",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === "+") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "PLUS",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === "-") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "MINUS",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === "*") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "MUL",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === "/") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "FLOAT_DIV",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === "(") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "LPAREN",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === ")") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "RPAREN",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === ";") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "SEMI",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      if (currentChar === ".") {
        const startPos = this.pos;
        this.advance();
        return {
          type: "DOT",
          startPos: startPos,
          stopPos: this.pos,
        };
      }

      const err = new UnexpectedChar(currentChar, this.pos);
      throw err;
    }
    return {
      type: "EOF",
      startPos: this.pos,
      stopPos: this.pos + 1,
    };
  }
}

export { UnexpectedChar };
export default Lexer;
