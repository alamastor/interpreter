/* @flow */
import type { ProcedureDecl } from "./Parser";

export default class ScopedNameSpace {
  scopeName: string;
  scopeLevel: number;
  enclosingScope: ?ScopedNameSpace;
  procedures: { [string]: ProcedureDecl };
  values: { [string]: number };

  constructor(
    scopeName: string,
    scopeLevel: number,
    enclosingScope?: ScopedNameSpace,
  ) {
    this.values = {};
    this.procedures = {};
    this.scopeName = scopeName;
    this.scopeLevel = scopeLevel;
    this.enclosingScope = enclosingScope;
  }

  insertValue(name: string, value: number) {
    this.values[name] = value;
  }

  insertProcedure(proc: ProcedureDecl) {
    this.procedures[proc.name] = proc;
  }

  lookUpValue(name: string): ?number {
    const value = this.values[name];
    if (value) {
      return value;
    }
    if (this.enclosingScope) {
      return this.enclosingScope.lookUpValue(name);
    }
  }

  lookUpProcedure(name: string): ?ProcedureDecl {
    const procedure = this.procedures[name];
    if (procedure) {
      return procedure;
    }
    if (this.enclosingScope) {
      return this.enclosingScope.lookUpProcedure(name);
    }
  }
}
