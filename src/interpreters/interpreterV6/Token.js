type Token =  {
  type: 'INTEGER',
  value: number
} | {
  type: 'PLUS'
} | {
  type: 'MINUS'
} | {
  type: 'MUL'
} | {
  type: 'DIV'
} | {
  type: 'LPAREN'
} | {
  type: 'RPAREN'
} | {
  type: 'EOF'
}

export type { Token }