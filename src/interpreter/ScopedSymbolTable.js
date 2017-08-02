/* @flow */

export type ASTSymbol = BuiltinTypeSymbol | VarSymbol | ProcedureSymbol;

type BuiltinTypeSymbol = {|
  symbolType: "builtin_type",
  name: string,
|};

export type VarSymbol = {|
  symbolType: "var",
  name: string,
  type: BuiltinTypeSymbol,
|};

export type ProcedureSymbol = {|
  symbolType: "procedure",
  name: string,
  params: Array<VarSymbol>,
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
    this.insert({ symbolType: "builtin_type", name: "INTEGER" });
    this.insert({ symbolType: "builtin_type", name: "REAL" });
  }

  insert(symbol: ASTSymbol) {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name: string) {
    return this.symbols.get(name);
  }
}
