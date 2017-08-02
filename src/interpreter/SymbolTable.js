/* @flow */

export type ASTSymbol = BuiltinTypeSymbol | VarSymbol;

type BuiltinTypeSymbol = {|
  symbolType: "builtin_type",
  name: string,
|};

type VarSymbol = {|
  symbolType: "var",
  name: string,
  type: BuiltinTypeSymbol,
|};

export default class SymbolTable {
  symbols: Map<string, ASTSymbol>;

  constructor() {
    this.symbols = new Map();
    this.initBuiltins();
  }

  initBuiltins() {
    this.define({ symbolType: "builtin_type", name: "INTEGER" });
    this.define({ symbolType: "builtin_type", name: "REAL" });
  }

  define(symbol: ASTSymbol) {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name: string) {
    return this.symbols.get(name);
  }
}
