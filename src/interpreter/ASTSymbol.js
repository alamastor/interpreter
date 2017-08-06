/* @flow */

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

export type ASTSymbol = BuiltinTypeSymbol | VarSymbol | ProcedureSymbol;

const toBuiltinTypeSymbol = (x: mixed): ?BuiltinTypeSymbol => {
  if (
    typeof x === "object" &&
    x &&
    x.hasOwnProperty("symbolType") &&
    x.symbolType === "builtin_type" &&
    x.hasOwnProperty("name") &&
    typeof x.name === "string"
  ) {
    return {
      symbolType: "builtin_type",
      name: x.name,
    };
  }
};

const toVarSymblol = (x: mixed): ?VarSymbol => {
  if (
    typeof x === "object" &&
    x &&
    x.hasOwnProperty("symbolType") &&
    x.symbolType === "var" &&
    x.hasOwnProperty("name") &&
    typeof x.name === "string" &&
    x.hasOwnProperty("type")
  ) {
    const name = x.name;
    const maybeType = toBuiltinTypeSymbol(x.type);
    if (!maybeType) {
      return;
    }
    const result: VarSymbol = {
      symbolType: "var",
      name: name,
      type: maybeType,
    };
    return result;
  }
};

const toProcedureSymbol = (x: mixed): ?ProcedureSymbol => {
  if (
    typeof x === "object" &&
    x &&
    x.hasOwnProperty("symbolType") &&
    x.symbolType === "procedure" &&
    x.hasOwnProperty("name") &&
    typeof x.name === "string" &&
    x.hasOwnProperty("params") &&
    typeof x.params === "object"
  ) {
    const name = x.name;
    let params;
    if (Array.isArray(x.params)) {
      params = x.params;
    } else {
      return;
    }
    const result: ProcedureSymbol = {
      symbolType: "procedure",
      name: name,
      params: params,
    };
    return result;
  }
};

export const toASTSymbol = (x: mixed): ?ASTSymbol => {
  return toBuiltinTypeSymbol(x) || toVarSymblol(x) || toProcedureSymbol(x);
};
