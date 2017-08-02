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

export default class ScopedSymbolTable {
  symbols: Map<string, ASTSymbol>;

  constructor(scopeName: string, scopeLevel: number) {
    this.symbols = new Map();
    self.scopeName = scopeName;
    self.scopeLevel = scopeLevel;
    this._initBuiltins();
  }

  _initBuiltins() {
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
