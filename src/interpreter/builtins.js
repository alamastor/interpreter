/* @flow */
import type { ProcedureDecl } from "./Parser";

export const write: ProcedureDecl = {
  type: "procedure_decl",
  name: "write",
  params: [
    {
      type: "param",
      varNode: {
        type: "var",
        token: {
          type: "ID",
          value: "value",
          startPos: 0,
          stopPos: 0,
        },
        name: "value",
        startPos: 0,
        stopPos: 0,
      },
      typeNode: {
        type: "type",
        token: {
          type: "REAL",
          startPos: 0,
          stopPos: 0,
        },
        value: "REAL",
        startPos: 0,
        stopPos: 0,
      },
      startPos: 0,
      stopPos: 0,
    },
  ],
  block: {
    type: "block",
    declarations: [],
    compoundStatement: {
      type: "compound",
      children: [
        {
          type: "write_stream",
          stream: "STDOUT",
          var: {
            type: "var",
            token: {
              type: "ID",
              value: "value",
              startPos: 0,
              stopPos: 0,
            },
            name: "value",
            startPos: 0,
            stopPos: 0,
          },
          startPos: 0,
          stopPos: 0,
        },
      ],
      startPos: 0,
      stopPos: 0,
    },
    startPos: 0,
    stopPos: 0,
  },
  startPos: 0,
  stopPos: 0,
};
