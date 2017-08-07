/* @flow */
import type { Token } from "./Token";

type TextState = {|
  text: string,
  position: number,
|};

const isSpace = (s: ?string) => {
  if (s != null) {
    return s.match(/ |\n/);
  } else {
    return false;
  }
};

const isDigit = (s: ?string) => {
  if (s != null) {
    return !isNaN(parseInt(s, 10));
  } else {
    return false;
  }
};

const isAlpha = (s: ?string) => {
  if (s == null) {
    return false;
  }
  if (s.length !== 1) {
    throw new Error("Expected single char, got " + s);
  }
  return s.match(/[A-Z|a-z|_]/);
};

const isAlphaNum = (s: ?string) => {
  if (s == null) {
    return false;
  }
  if (s.length !== 1) {
    throw new Error("Expected single char, got " + s);
  }
  return s.match(/[A-Z|a-z|0-9|_]/);
};

const advance = (textState: TextState): TextState => ({
  text: textState.text,
  position: textState.position + 1,
});

const currentChar = (textState: TextState): ?string => {
  if (textState.position > textState.text.length - 1) {
    return null;
  } else {
    return textState.text[textState.position];
  }
};

const skipWhitespace = (textState: TextState): TextState => {
  const current = currentChar(textState);
  if (current != null && isSpace(current)) {
    return skipWhitespace(advance(textState));
  }
  return textState;
};

const skipComment = (textState: TextState): TextState => {
  if (currentChar(textState) !== "}") {
    return skipComment(advance(textState));
  }
  return advance(textState);
};

const skipWhitespaceAndComments = (textState: TextState): TextState => {
  const current = currentChar(textState);
  if (current != null && isSpace(current)) {
    textState = skipWhitespace(textState);
    return skipWhitespaceAndComments(textState);
  }

  if (currentChar(textState) === "{") {
    textState = skipComment(textState);
    return skipWhitespaceAndComments(textState);
  }
  return textState;
};

const peek = (textState: TextState): ?string =>
  currentChar({
    text: textState.text,
    position: textState.position + 1,
  });

const idToken = (str: string, startPos: number, stopPos: number): Token => {
  switch (str.toUpperCase()) {
    case "BEGIN":
      return {
        type: "BEGIN",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "DIV":
      return {
        type: "INTEGER_DIV",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "END":
      return {
        type: "END",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "INTEGER":
      return {
        type: "INTEGER",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "PROCEDURE":
      return {
        type: "PROCEDURE",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "PROGRAM":
      return {
        type: "PROGRAM",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "REAL":
      return {
        type: "REAL",
        startPos: startPos,
        stopPos: stopPos,
      };
    case "VAR":
      return {
        type: "VAR",
        startPos: startPos,
        stopPos: stopPos,
      };
    default:
      return {
        type: "ID",
        value: str,
        startPos: startPos,
        stopPos: stopPos,
      };
  }
};

const id = (textState: TextState): { token: Token, textState: TextState } => {
  let result = "";
  const startPos = textState.position;
  for (
    let current = currentChar(textState);
    current != null && isAlphaNum(current);
    current = currentChar(textState)
  ) {
    result += current;
    textState = advance(textState);
  }
  return {
    token: idToken(result, startPos, textState.position),
    textState: textState,
  };
};

const number = (
  textState: TextState,
): { token: Token, textState: TextState } => {
  let result = "";
  const startPos = textState.position;
  for (
    let current = currentChar(textState);
    current != null && isDigit(current) && typeof current === "string";
    current = currentChar(textState)
  ) {
    result += current;
    textState = advance(textState);
  }

  if (currentChar(textState) === ".") {
    result += ".";
    textState = advance(textState);
    for (
      let current = currentChar(textState);
      current != null && isDigit(current) && typeof current === "string";
      current = currentChar(textState)
    ) {
      result += current;
      textState = advance(textState);
    }
    return {
      token: {
        type: "REAL_CONST",
        value: parseFloat(result),
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }
  return {
    token: {
      type: "INTEGER_CONST",
      value: parseInt(result, 10),
      startPos: startPos,
      stopPos: textState.position,
    },
    textState: textState,
  };
};

const getNextToken = (
  textState: TextState,
): { token: Token, textState: TextState } => {
  textState = skipWhitespaceAndComments(textState);
  if (currentChar(textState) == null) {
    return {
      token: {
        type: "EOF",
        startPos: textState.position,
        stopPos: textState.position + 1,
      },
      textState: textState,
    };
  }
  if (isAlpha(currentChar(textState))) {
    return id(textState);
  }

  if (isDigit(currentChar(textState))) {
    return number(textState);
  }

  if (currentChar(textState) === ":" && peek(textState) === "=") {
    const startPos = textState.position;
    textState = advance(advance(textState));
    return {
      token: {
        type: "ASSIGN",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === ":") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "COLON",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === ",") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "COMMA",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === "+") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "PLUS",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === "-") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "MINUS",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === "*") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "MUL",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === "/") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "FLOAT_DIV",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === "(") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "LPAREN",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === ")") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "RPAREN",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === ";") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "SEMI",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  if (currentChar(textState) === ".") {
    const startPos = textState.position;
    textState = advance(textState);
    return {
      token: {
        type: "DOT",
        startPos: startPos,
        stopPos: textState.position,
      },
      textState: textState,
    };
  }

  return {
    token: {
      type: "UNEXPECTED_CHAR",
      startPos: textState.position,
      stopPos: textState.position + 1,
    },
    textState: textState,
  };
};

export const lex = (text: string): Array<Token> => {
  let textState = { text: text, position: 0 };
  let token: Token;
  ({ textState, token } = getNextToken(textState));
  const result = [token];
  while (
    result[result.length - 1].type !== "EOF" &&
    result[result.length - 1].type !== "UNEXPECTED_CHAR"
  ) {
    ({ textState, token } = getNextToken(textState));
    result.push(token);
  }
  return result;
};
