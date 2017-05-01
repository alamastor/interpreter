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
  type: 'EOF'
}

export type { Token }