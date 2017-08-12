/* @flow */
import type { Action } from "../../actionTypes";
import type { Token } from "../../interpreter/Token";

export const onClickTokensToggle = (): Action => ({
  type: "interpreter_view_tokens_toggle_click",
});

export const onHoverToken = (token: Token): Action => ({
  type: "token_hover",
  token: token,
});

export const onStopHoverToken = (): Action => ({
  type: "token_hover_stop",
});
