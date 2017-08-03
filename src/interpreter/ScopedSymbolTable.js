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
  scopeName: string;
  scopeLevel: number;
  enclosingScope: ?ScopedSymbolTable;

  constructor(
    scopeName: string,
    scopeLevel: number,
    enclosingScope?: ScopedSymbolTable,
  ) {
    this.symbols = new Map();
    this.scopeName = scopeName;
    this.scopeLevel = scopeLevel;
    this.enclosingScope = enclosingScope;
    this._initBuiltins();
  }

  _initBuiltins() {
    this.insert({ symbolType: "builtin_type", name: "INTEGER" });
    this.insert({ symbolType: "builtin_type", name: "REAL" });
  }

  insert(symbol: ASTSymbol) {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name: string, currentScopeOnly?: boolean) {
    const symbol = this.symbols.get(name);

    if (symbol) {
      return symbol;
    }

    if (currentScopeOnly) {
      return;
    }

    if (this.enclosingScope) {
      return this.enclosingScope.lookup(name);
    }
  }
}
