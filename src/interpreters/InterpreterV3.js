type Token =  {
  type: 'INTEGER',
  value: number
} | {
  type: 'PLUS'
} | {
  type: 'MINUS'
} | {
  type: 'EOF'
}

const isSpace = (s: ?string) => s === ' '

const isDigit = (s: ?string) => !isNaN(parseInt(s, 10))

class Interpreter {
  text: string;
  pos: number;
  currentToken: Token;
  currentChar: ?string;

  grammar = [
    'expr : INTEGER ((PLUS | MINUS) INTEGER)*'
  ]

  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentToken = { type: 'EOF' }
    this.currentChar = this.text[this.pos]
  }

  advance() {
    this.pos++
    if (this.pos > this.text.length - 1) {
      this.currentChar = null;
    } else {
      this.currentChar = this.text[this.pos]
    }
  }

  skipWhitespace() {
    while (this.currentChar !== null && isSpace(this.currentChar)) {
      this.advance()
    }
  }

  integer() {
    let result = ''
    while (
      this.currentChar !== null &&
      isDigit(this.currentChar) &&
      typeof this.currentChar === 'string'
    ) {
      result += this.currentChar
      this.advance()
    }
    return parseInt(result, 10)
  }

  getNextToken(): Token {
    const text = this.text

    while (this.currentChar !== null) {
      const currentChar = text[this.pos]

      if (isSpace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }

      if (isDigit(currentChar)) {
        return { type: 'INTEGER', value: this.integer() }
      }

      if (currentChar === '+') {
        this.advance()
        return { type: 'PLUS' }
      }

      if (currentChar === '-') {
        this.advance()
        return { type: 'MINUS' }
      }

      throw new Error('Unrecognized token: "' + currentChar + '".')
    }
    return { type: 'EOF' }
  }

  eat(tokenType: string) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.getNextToken()
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

  term(): number {
    const token = this.currentToken
    this.eat('INTEGER')
    if (token.value && typeof token.value === 'number') {
      return token.value
    } else {
      throw new Error('Invalid token (impossible state).')
    }
  }

  /**
   * expr : INTEGER ((PLUS | MINUS) INTEGER)*
   */
  expr(): string {
    this.currentToken = this.getNextToken()

    let result = this.term()
    while (
      this.currentToken.type === 'PLUS' ||
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
    return result.toString();
  }

  interpret(): string {
    if (this.text.length === 0) {
      // No code to parse.
      return ''
    }

    try {
      return this.expr()
    } catch (e) {
      return 'Error: ' + e.message
    }
  }
}

export default Interpreter