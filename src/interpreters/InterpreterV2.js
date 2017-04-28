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

  grammer = [
    'expr : INTEGER (PLUS | MINUS) INTEGER'
  ]

  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentToken = { type: 'EOF' }
    this.currentChar = this.text[this.pos]
  }

  error(text: string): Error {
    throw new Error(text)
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

      this.error('Unrecognized token: "' + currentChar + '".')
      return { type: 'EOF' }
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

  /**
   * expr -> INTEGER (PLUS | MINUS) INTEGER
   */
  expr(): string {
    this.currentToken = this.getNextToken()

    const left = this.currentToken
    this.eat('INTEGER')

    const op = this.currentToken
    if (op.type === 'PLUS') {
      this.eat('PLUS')
    } else {
      this.eat('MINUS')
    }

    const right = this.currentToken
    this.eat('INTEGER')

    if (
      typeof left.value === 'number' &&
      typeof right.value === 'number'
    ) {
      if (op.type === 'PLUS') {
        return (left.value + right.value).toString()
      } else {
        return (left.value - right.value).toString()
      }
    } else {
      this.error('Wrong token type (Impossible state)')
      return ''
    }
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