/* @flow */
export type Token =
  | {
      type: "ASSIGN",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "BEGIN",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "COLON",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "COMMA",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "DOT",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "END",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "EOF",
      startPos: number,
      stopPos: number,
    }
  | FLOAT_DIV
  | ID
  | {
      type: "INTEGER",
      startPos: number,
      stopPos: number,
    }
  | INTEGER_CONST
  | INTEGER_DIV
  | {
      type: "LPAREN",
      startPos: number,
      stopPos: number,
    }
  | MINUS
  | MUL
  | {
      type: "PROCEDURE",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "PROGRAM",
      startPos: number,
      stopPos: number,
    }
  | PLUS
  | {
      type: "REAL",
      startPos: number,
      stopPos: number,
    }
  | REAL_CONST
  | {
      type: "RPAREN",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "SEMI",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "UNEXPECTED_CHAR",
      startPos: number,
      stopPos: number,
    }
  | {
      type: "VAR",
      startPos: number,
      stopPos: number,
    };

export type PLUS = {
  type: "PLUS",
  startPos: number,
  stopPos: number,
};

export type MINUS = {
  type: "MINUS",
  startPos: number,
  stopPos: number,
};

export type MUL = {
  type: "MUL",
  startPos: number,
  stopPos: number,
};

export type INTEGER_DIV = {
  type: "INTEGER_DIV",
  startPos: number,
  stopPos: number,
};

export type FLOAT_DIV = {
  type: "FLOAT_DIV",
  startPos: number,
  stopPos: number,
};

export type INTEGER_CONST = {
  type: "INTEGER_CONST",
  value: number,
  startPos: number,
  stopPos: number,
};

export type REAL_CONST = {
  type: "REAL_CONST",
  value: number,
  startPos: number,
  stopPos: number,
};

export type ID = {
  type: "ID",
  name: string,
  startPos: number,
  stopPos: number,
};
