/* @flow */
import Lexer from "./interpreter/Lexer";
import { UnexpectedChar } from "./interpreter/Lexer";
import type { Token } from "./interpreter/Token";

class TokenMiddleware {
  lexer: Lexer;
  pushToken: (Token | UnexpectedChar) => void;

  constructor(
    lexer: Lexer,
    resetTokenList: () => void,
    pushToken: Token => void,
  ) {
    this.lexer = lexer;
    this.pushToken = pushToken;
    resetTokenList();
  }

  getNextToken() {
    try {
      const token = this.lexer.getNextToken();
      this.pushToken(token);
      return token;
    } catch (e) {
      if (e instanceof UnexpectedChar) {
        this.pushToken(e);
      }
      throw e;
    }
  }
}

export default TokenMiddleware;
