type TokenUnion =
  | {
      type: "INTEGER",
      value: number,
    }
  | {
      type: "PLUS",
    }
  | {
      type: "MINUS",
    }
  | {
      type: "MUL",
    }
  | {
      type: "DIV",
    }
  | {
      type: "LPAREN",
    }
  | {
      type: "RPAREN",
    }
  | {
      type: "EOF",
    };

type TokenBase = {
  startPos: number,
  stopPos: number,
};

type Token = TokenUnion & TokenBase;
export type { Token };
