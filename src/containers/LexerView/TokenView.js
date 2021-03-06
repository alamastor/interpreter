/* @flow */
import React from "react";
import type { Action } from "../../actionTypes";
import type { Token } from "../../interpreter/Token";

export default (props: {
  token: Token,
  onHoverToken: Token => Action,
  onStopHoverToken: () => Action,
}) => {
  let result = props.token.type;
  if (props.token.hasOwnProperty("value")) {
    if (typeof props.token.value === "number") {
      result += ": " + props.token.value.toString(10);
    } else if (typeof props.token.value === "string") {
      result += ": " + props.token.value;
    }
  }
  const onMouseEnter = () => props.onHoverToken(props.token);
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
