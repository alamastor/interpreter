import typeof { Lexer } from './interpreters/interpreter/Lexer'

class TokenMiddleware {
  lexer: Lexer
  pushToken: Function

  constructor (
    lexer: Lexer,
    resetTokenList: Function,
    pushToken: Function
  ) {
    this.lexer = lexer
    this.pushToken = pushToken
    resetTokenList()
  }

  getNextToken() {
    try {
      const token = this.lexer.getNextToken()
      this.pushToken(token)
      return token
    } catch (e) {
      this.pushToken(e)
      throw e
    }
  }
}

export default TokenMiddleware