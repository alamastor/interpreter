type Token =  {
  type: 'INTEGER',
  value: number
} | {
  type: 'PLUS'
} | {
  type: 'EOF'
}

class Interpreter {
  text: string;
  pos: number;
  currentToken: Token;

  grammar = [
    'expr : INTEGER PLUS INTEGER',
  ]

  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentToken = { type: 'EOF' }
  }

  error(text: string): Error {
    throw new Error(text)
  }

  getNextToken(): Token {
    const text = this.text

    if (this.pos > text.length - 1) {
      return { type: 'EOF' }
    }

    const currentChar = text[this.pos]

    if (!isNaN(parseInt(currentChar, 10))) {
      this.pos++
      return { type: 'INTEGER', value: parseInt(currentChar, 10) }
    }

    if (currentChar === '+') {
      this.pos++
      return { type: 'PLUS' }
    }

    this.error('Unrecognized token: "' + currentChar + '".')
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
        errStr = errStr +
        ' with value "' + this.currentToken.value
      }
      errStr += '".'
      throw new Error(errStr)
    }
  }

  /**
   * expr -> INTEGER PLUS INTEGER
   */
  expr(): string {
    this.currentToken = this.getNextToken()

    const left = this.currentToken
    this.eat('INTEGER')

    this.eat('PLUS')

    const right = this.currentToken
    this.eat('INTEGER')

    if (
      typeof left.value === 'number' &&
      typeof right.value === 'number'
    ) {
      const result = left.value + right.value
      return result.toString()
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