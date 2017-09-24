/* @flow */
import type { Action } from "../../actionTypes";
import type { Node } from "./Stratifier";
import type { Token } from "../../interpreter/Token";

export const onHoverNode = (node: Node): Action => ({
  type: "ast_node_hover",
  node: node,
});

export const onStopHoverNode = (): Action => ({
  type: "ast_node_hover_stop",
});

export const onClickNode = (node: Node): Action => ({
  type: "ast_node_click",
  node: node,
});

export const onReceiveTokenList = (tokenList: Array<Token>) => ({
  type: "ast_received_token_list",
  tokenList: tokenList,
});
