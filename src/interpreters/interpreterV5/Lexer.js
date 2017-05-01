import type { Token } from './Token'

const isSpace = (s: ?string) => s === ' '

const isDigit = (s: ?string) => !isNaN(parseInt(s, 10))

class Lexer {
  text: string;
  pos: number;
  currentChar: ?string;

  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentChar = this.text[this.pos]
  }

  isEmpty() {
    return this.text.length === 0
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

      if (currentChar === '*') {
        this.advance()
        return { type: 'MUL' }
      }

      if (currentChar === '/') {
        this.advance()
        return { type: 'DIV' }
      }

      throw new Error('Unrecognized token: "' + currentChar + '".')
    }
    return { type: 'EOF' }
  }

}

export default Lexer