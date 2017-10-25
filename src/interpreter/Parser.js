/* @flow */
import ExtendableError from "es6-error";
import type {
  Token,
  PLUS,
  MINUS,
  MUL,
  INTEGER_DIV,
  FLOAT_DIV,
  ID,
  INTEGER_CONST,
  REAL_CONST,
} from "./Token";

/* eslint-disable no-use-before-define */
export type Assign = {|
  type: "assign",
  variable: Var,
  value: BinOp | Num | UnaryOp | Var,
  startPos: number,
  stopPos: number,
|};

export type BinOp = {|
  type: "bin_op",
  left: BinOp | Num | UnaryOp | Var,
  op: PLUS | MINUS | MUL | INTEGER_DIV | FLOAT_DIV,
  right: BinOp | Num | UnaryOp | Var,
  startPos: number,
  stopPos: number,
|};

export type Block = {|
  type: "block",
  declarations: Array<VarDecl | ProcedureDecl>,
  compoundStatement: Compound,
  startPos: number,
  stopPos: number,
|};

export type Compound = {|
  type: "compound",
  children: Array<ProcedureCall | Compound | Assign | NoOp>,
  startPos: number,
  stopPos: number,
|};

export type NoOp = {|
  type: "no_op",
  startPos: number,
  stopPos: number,
|};

export type Num = {|
  type: "num",
  token: INTEGER_CONST | REAL_CONST,
  startPos: number,
  stopPos: number,
|};

export type Param = {|
  type: "param",
  varNode: Var,
  typeNode: Type,
  startPos: number,
  stopPos: number,
|};

export type ProcedureCall = {|
  type: "procedure_call",
  name: string,
  params: Array<BinOp | Num | UnaryOp | Var>,
  startPos: number,
  stopPos: number,
|};

export type ProcedureDecl = {|
  type: "procedure_decl",
  name: string,
  params: Array<Param>,
  block: Block,
  startPos: number,
  stopPos: number,
|};

export type Program = {|
  type: "program",
  name: string,
  block: Block,
  startPos: number,
  stopPos: number,
|};

export type Type = {|
  type: "type",
  token: Token,
  value: string,
  startPos: number,
  stopPos: number,
|};

export type UnaryOp = {|
  type: "unary_op",
  op: PLUS | MINUS,
  expr: BinOp | Num | UnaryOp | Var,
  startPos: number,
  stopPos: number,
|};

export type Var = {|
  type: "var",
  token: ID,
  name: string,
  startPos: number,
  stopPos: number,
|};

export type VarDecl = {|
  type: "var_decl",
  varNode: Var,
  typeNode: Type,
  startPos: number,
  stopPos: number,
|};
/* eslint-enable no-use-before-define */

export type ASTNode =
  | Assign
  | BinOp
  | Block
  | Compound
  | NoOp
  | Num
  | Program
  | Type
  | UnaryOp
  | Var
  | VarDecl;

class UnexpectedToken extends ExtendableError {
  constructor(token: Token, expected: ?(string | Array<string>)) {
    let msg = 'Unexpected token "' + token.type;
    if (expected != null) {
      if (typeof expected === "string") {
        msg += '", expected "' + expected;
      } else if (expected.length === 1) {
        msg += '", expected "' + expected[0];
      } else {
        msg +=
          '", expected "' +
          expected.slice(0, -1).join(", ") +
          ", or " +
          expected[expected.length - 1];
      }
    }
    msg += '".';
    super(msg);
  }
}

class Parser {
  tokens: Array<Token>;
  currentToken: Token;
  tokenIndex: number;

  static grammar = [
    "program             : PROGRAM variable SEMI block DOT EOF",
    "block               : declarations compound_statement",
    "declarations        : VAR (variable_declaration SEMI)+ | (PROCEDURE ID SEMI block SEMI)* | empty",
    "variable_declaration: ID (COMMA ID)* COLON type_spec",
    "type_spec           : INTEGER",
    "compound_statement  : BEGIN statement_list END",
    "statement_list      : statement | statement SEMI statement_list",
    "statement           : procedure_statement | compound_statement | assignment_statement | empty",
    "assignment_statement: variable ASSIGN expr",
    "procedure_statement : variable | variable LPAREN expr_list RPAREN",
    "expr_list           : expr (COMMA expr)*",
    "empty               :",
    "expr                : term ((PLUS | MINUS) term)*",
    "term                : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*",
    "factor              : PLUS factor | MINUS factor | INTEGER_CONST | REAL_CONST | LPAREN expr RPAREN | variable",
  ];

  constructor(tokens: Array<Token>) {
    this.tokens = tokens;
    this.tokenIndex = 0;
  }

  eat(tokenType: string) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.tokens[this.tokenIndex++];
    } else {
      throw new UnexpectedToken(this.currentToken, tokenType);
    }
  }

  peek(): Token {
    return this.tokens[this.tokenIndex + 1];
  }

  /**
   * program : PROGRAM variable SEMI block DOT EOF
   */
  program(): Program {
    const startPos = this.currentToken.startPos;
    this.eat("PROGRAM");
    const varNode = this.variable();
    const progName = varNode.name;
    this.eat("SEMI");
    const blockNode = this.block();
    const stopPos = this.currentToken.stopPos;
    this.eat("DOT");
    return {
      type: "program",
      name: progName,
      block: blockNode,
      startPos: startPos,
      stopPos: stopPos,
    };
  }

  /**
   * block : declarations compound_statement
   */
  block(): Block {
    const startPos = this.currentToken.startPos;
    const declarationNodes = this.declarations();
    const compoundStatementNode = this.compoundStatement();
    return {
      type: "block",
      declarations: declarationNodes,
      compoundStatement: compoundStatementNode,
      startPos: startPos,
      stopPos: this.currentToken.startPos,
    };
  }

  /**
   * declarations : VAR (variable_declaration SEMI)+
   *              | (PROCEDURE ID (LPAREN formal_parameter_list RPAREN)? SEMI block SEMI)*
   *              | empty
   */
  declarations(): Array<VarDecl | ProcedureDecl> {
    let declarations: Array<VarDecl | ProcedureDecl> = [];
    while (this.currentToken.type === "VAR") {
      this.eat("VAR");
      while (this.currentToken.type === "ID") {
        declarations = declarations.concat(this.variableDeclaration());
        this.eat("SEMI");
      }
    }
    while (this.currentToken.type === "PROCEDURE") {
      const startPos = this.currentToken.startPos;
      this.eat("PROCEDURE");
      let procName: string;
      if (this.currentToken.type === "ID") {
        procName = this.currentToken.value;
        this.eat("ID");
      } else {
        throw new UnexpectedToken(this.currentToken, "ID");
      }
      let params: Array<Param> = [];
      if (this.currentToken.type === "LPAREN") {
        this.eat("LPAREN");
        params = this.formalParameterList();
        this.eat("RPAREN");
      }
      this.eat("SEMI");
      const block = this.block();
      declarations.push({
        type: "procedure_decl",
        name: procName,
        block: block,
        params: params,
        startPos: startPos,
        stopPos: this.currentToken.stopPos,
      });
      this.eat("SEMI");
    }
    return declarations;
  }

  /**
   * formal_parameter_list : formal_parameters
   *                       | formal_parameters SEMI formal_parameter_list
   */
  formalParameterList(): Array<Param> {
    const params: Array<Param> = this.formalParameters();
    if (this.currentToken.type === "SEMI") {
      this.eat("SEMI");
      return params.concat(this.formalParameterList());
    }
    return params;
  }

  /**
   * formal_parameter : ID (COMMA ID)* COLON type_spec
   */
  formalParameters(): Array<Param> {
    const varNodes = [this.variable()];
    while (this.currentToken.type === "COMMA") {
      this.eat("COMMA");
      varNodes.push(this.variable());
    }

    this.eat("COLON");

    const typeNode = this.typeSpec();
    const params = varNodes.map(node => ({
      type: "param",
      varNode: node,
      typeNode: typeNode,
      startPos: node.startPos,
      stopPos: typeNode.stopPos,
    }));
    return params;
  }

  /**
   * variable_declaration : ID (COMMA ID)* COLON type_spec
   */
  variableDeclaration(): Array<VarDecl> {
    const varNodes = [this.variable()];

    while (this.currentToken.type === "COMMA") {
      this.eat("COMMA");
      varNodes.push(this.variable());
    }

    this.eat("COLON");

    const typeNode = this.typeSpec();
    const varDeclarations = varNodes.map(node => ({
      type: "var_decl",
      varNode: node,
      typeNode: typeNode,
      startPos: node.startPos,
      stopPos: typeNode.stopPos,
    }));
    return varDeclarations;
  }

  /**
   * type_spec : INTEGER | REAL
   */
  typeSpec(): Type {
    const token = this.currentToken;
    if (token.type === "INTEGER") {
      this.eat("INTEGER");
      return {
        type: "type",
        token: token,
        value: "INTEGER",
        startPos: token.startPos,
        stopPos: token.stopPos,
      };
    } else if (token.type === "REAL") {
      this.eat("REAL");
      return {
        type: "type",
        token: token,
        value: "REAL",
        startPos: token.startPos,
        stopPos: token.stopPos,
      };
    } else {
      throw new UnexpectedToken(token, ["INTEGER", "REAL"]);
    }
  }

  /**
   * compound_statement: BEGIN statement_list END
   */
  compoundStatement(): Compound {
    const startPos = this.currentToken.startPos;
    this.eat("BEGIN");
    const children = this.statementList();
    this.eat("END");

    return {
      type: "compound",
      children: children,
      startPos: startPos,
      stopPos: children[children.length - 1].stopPos,
    };
  }

  /**
   * statement_list: statement | statement SEMI statement_list
   */
  statementList(): Array<ProcedureCall | Compound | Assign | NoOp> {
    const result = [this.statement()];

    while (this.currentToken.type === "SEMI") {
      this.eat("SEMI");
      result.push(this.statement());
    }

    if (this.currentToken.type === "ID") {
      throw new Error("Unexpected ID token");
    }

    return result;
  }

  /**
   * statement : procedure_statement | compound_statement | assignment_statement | empty
   */
  statement(): ProcedureCall | Compound | Assign | NoOp {
    if (this.currentToken.type === "BEGIN") {
      return this.compoundStatement();
    } else if (this.currentToken.type === "ID") {
      const peekToken = this.peek();
      if (peekToken && peekToken.type === "ASSIGN") {
        return this.assignmentStatement();
      } else {
        return this.procedureStatement();
      }
    } else {
      return this.empty();
    }
  }

  /**
   * procedure_statement : variable | variable LPAREN expr_list RPAREN
   */
  procedureStatement(): ProcedureCall {
    const startPos = this.currentToken.startPos;
    const variable = this.variable();
    let params;
    let stopPos;
    if (this.currentToken.type === "LPAREN") {
      this.eat("LPAREN");
      params = this.exprList();
      stopPos = this.currentToken.stopPos;
      this.eat("RPAREN");
    } else {
      params = [];
      stopPos = variable.stopPos;
    }

    return {
      type: "procedure_call",
      name: variable.name,
      params: params,
      startPos: startPos,
      stopPos: stopPos,
    };
  }

  exprList(): Array<BinOp | Num | UnaryOp | Var> {
    const expressions = [this.expr()];
    if (this.currentToken.type === "COMMA") {
      this.eat("COMMA");
      expressions.push(this.expr());
    }
    return expressions;
  }

  /**
   * assignment_statement : variable ASSIGN expr
   */
  assignmentStatement(): Assign {
    const startPos = this.currentToken.startPos;
    const variable = this.variable();
    this.eat("ASSIGN");
    const value = this.expr();
    return {
      type: "assign",
      variable: variable,
      value: value,
      startPos: startPos,
      stopPos: value.stopPos,
    };
  }

  /**
   * variable : ID
   */
  variable(): Var {
    if (this.currentToken.type === "ID") {
      const token: ID = this.currentToken;
      this.eat("ID");
      const res: Var = {
        type: "var",
        token: token,
        name: token.value,
        startPos: token.startPos,
        stopPos: token.stopPos,
      };
      return res;
    } else {
      throw new UnexpectedToken(this.currentToken, "ID");
    }
  }

  /**
   * empty :
   */
  empty(): NoOp {
    return {
      type: "no_op",
      startPos: this.currentToken.startPos,
      stopPos: this.currentToken.startPos,
    };
  }

  /**
   * factor : PLUS factor
   *        | MINUS factor
   *        | INTEGER_CONST
   *        | REAL_CONST
   *        | LPAREN expr RPAREN
   *        | variable
   */
  factor(): BinOp | Num | UnaryOp | Var {
    const startPos = this.currentToken.startPos;
    const token = this.currentToken;
    let factor;
    switch (token.type) {
      case "PLUS":
        this.eat("PLUS");
        factor = this.factor();
        return {
          type: "unary_op",
          op: token,
          expr: factor,
          startPos: startPos,
          stopPos: factor.stopPos,
        };
      case "MINUS":
        this.eat("MINUS");
        factor = this.factor();
        return {
          type: "unary_op",
          op: token,
          expr: factor,
          startPos: startPos,
          stopPos: factor.stopPos,
        };
      case "INTEGER_CONST":
        this.eat("INTEGER_CONST");
        return {
          type: "num",
          token: token,
          startPos: startPos,
          stopPos: token.stopPos,
        };
      case "REAL_CONST":
        this.eat("REAL_CONST");
        return {
          type: "num",
          token: token,
          startPos: startPos,
          stopPos: token.stopPos,
        };
      case "LPAREN":
        this.eat("LPAREN");
        const result = this.expr();
        this.eat("RPAREN");
        return result;
      case "ID":
        return this.variable();
      default:
        throw new UnexpectedToken(token, [
          "PLUS",
          "MINUS",
          "INTEGER_CONST",
          "REAL_CONST",
          "LPAREN",
          "ID",
        ]);
    }
  }

  /**
   * term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*
   */
  term(): BinOp | Num | Var | UnaryOp {
    const startPos = this.currentToken.startPos;
    var node = this.factor();
    while (
      this.currentToken.type === "MUL" ||
      this.currentToken.type === "INTEGER_DIV" ||
      this.currentToken.type === "FLOAT_DIV"
    ) {
      const op = this.currentToken;
      if (op.type === "MUL") {
        this.eat("MUL");
      } else if (op.type === "INTEGER_DIV") {
        this.eat("INTEGER_DIV");
      } else {
        this.eat("FLOAT_DIV");
      }
      const factor = this.factor();
      node = {
        type: "bin_op",
        left: node,
        op: op,
        right: factor,
        startPos: startPos,
        stopPos: factor.stopPos,
      };
    }
    return node;
  }

  /**
   * expr : term ((PLUS | MINUS) term)*
   */
  expr(): BinOp | Num | UnaryOp | Var {
    const startPos = this.currentToken.startPos;
    let node: BinOp | Num | UnaryOp | Var = this.term();
    while (
      this.currentToken.type === "PLUS" ||
      this.currentToken.type === "MINUS"
    ) {
      const op = this.currentToken;
      if (op.type === "PLUS") {
        this.eat("PLUS");
      } else {
        this.eat("MINUS");
      }
      const term = this.term();
      node = {
        type: "bin_op",
        left: node,
        op: op,
        right: term,
        startPos: startPos,
        stopPos: term.stopPos,
      };
    }
    return node;
  }

  parse(): ParserOutput {
    this.currentToken = this.tokens[this.tokenIndex++];
    if (this.currentToken.type === "EOF") {
      return {
        ast: null,
        error: "",
      };
    }
    try {
      const program = this.program();
      this.eat("EOF");
      return {
        ast: program,
        error: "",
      };
    } catch (e) {
      if (e instanceof UnexpectedToken) {
        return {
          ast: null,
          error: e.message,
        };
      } else {
        throw e;
      }
    }
  }
}

export type ParserOutput = {|
  ast: ?Program,
  error: "",
|};

export default Parser;
