/* @flow */
import type { ASTSymbol, VarSymbol } from "./ASTSymbol";
import { toVarSymbol } from "./ASTSymbol";

export default class ScopedSymbolTable {
  symbols: { [string]: ASTSymbol };
  scopeName: string;
  scopeLevel: number;
  enclosingScope: ?ScopedSymbolTable;

  constructor(
    scopeName: string,
    scopeLevel: number,
    enclosingScope?: ScopedSymbolTable,
  ) {
    this.symbols = {};
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
    this.symbols[symbol.name] = symbol;
  }

  lookup(name: string, currentScopeOnly?: boolean): ?ASTSymbol {
    const symbol: ASTSymbol = this.symbols[name];

    if (symbol) {
      return symbol;
    }

    if (currentScopeOnly != null) {
      return;
    }

    if (this.enclosingScope) {
      return this.enclosingScope.lookup(name);
    }
  }

  lookupVar(name: string): ?VarSymbol {
    return toVarSymbol(this.lookup(name));
  }
}
