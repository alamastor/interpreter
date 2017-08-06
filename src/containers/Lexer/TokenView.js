/* @flow */
import React from "react";
import type { Token } from "../../interpreter/Token";
import { UnexpectedChar } from "../../interpreter/Lexer";

export default (props: {
  tokenOrError: Token | UnexpectedChar,
  onHoverToken: (Token | UnexpectedChar) => void,
  onStopHoverToken: () => void,
}) => {
  const tokenOrError = props.tokenOrError;
  let result;
  if (tokenOrError instanceof UnexpectedChar) {
    const error = tokenOrError;
    result = error.message;
  } else {
    const token = tokenOrError;
    result = token.type;
    if (token.hasOwnProperty("value")) {
      if (typeof token.value === "number") {
        result += ": " + token.value.toString(10);
      } else if (typeof token.value === "string") {
        result += ": " + token.value;
      }
    }
  }

  const onMouseEnter = () => props.onHoverToken(tokenOrError);
  return (
    <li
      className="lexer--line"
      onMouseEnter={onMouseEnter}
      onMouseLeave={props.onStopHoverToken}
    >
      {result}
    </li>
  );
};
