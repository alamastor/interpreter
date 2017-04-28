type Token =  {
  type: 'INTEGER',
  value: number
} | {
  type: 'MUL'
} | {
  type: 'DIV'
} | {
  type: 'EOF'
}

export type { Token }