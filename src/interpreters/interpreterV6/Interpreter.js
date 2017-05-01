import Lexer from './Lexer'
import type { Token } from './Token'

class Interpreter {
  lexer: Lexer
  currentToken: Token

  grammar = [
    'expr   : term ((PLUS | MINUS) term)*',
    'term   : factor ((MUL | DIV) factor)*',
    'factor : INTEGER | LPAREN expr RPAREN',
  ]

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }

  eat(tokenType: string) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      let errStr =
        'Expected "' + tokenType + '" but got "' +
        this.currentToken.type;
      if (typeof this.currentToken.value === 'number') {
        errStr += ' with value "' + this.currentToken.value
      }
      errStr += '".'
      throw new Error(errStr)
    }
  }

  /**
   * factor : INTEGER | LPAREN expr RPAREN
   */
  factor(): number {
    const token = this.currentToken
    if (token.type === 'INTEGER') {
      this.eat('INTEGER')
      if (token.value && typeof token.value === 'number') {
        return token.value
      } else {
        throw new Error('Invalid token (impossible state).')
      }
    } else {
      this.eat('LPAREN')
      const result = this.expr()
      this.eat('RPAREN')
      return result
    }
  }

  /**
   * term : factor ((MUL | DIV) factor)*
   */
  term(): number {
    let result = this.factor()
    while (
      this.currentToken.type === 'MUL' ||
      this.currentToken.type === 'DIV'
    ) {
      const op = this.currentToken
      if (op.type === 'MUL') {
        this.eat('MUL')
        result *= this.factor()
      } else {
        this.eat('DIV')
        result /= this.factor()
      }
    }
    return result
  }

  /**
   * expr : factor ((PLUS | MINUS) term)*
   */
  expr(): number {
    let result = this.term()
    while (this.currentToken.type === 'PLUS' ||
      this.currentToken.type === 'MINUS'
    ) {
      const op = this.currentToken
      if (op.type === 'PLUS') {
        this.eat('PLUS')
        result += this.term()
      } else {
        this.eat('MINUS')
        result -= this.term()
      }
    }
    return result
  }

  interpret(): string {
    if (this.currentToken.type === 'EOF') {
      this.eat('EOF')
      return ''
    }

    try {
      let result = this.expr();
      this.eat('EOF')
      return result.toString()
    } catch (e) {
      return 'Error: ' + e.message
    }
  }
}

export default Interpreter