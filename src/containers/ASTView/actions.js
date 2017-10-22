/* @flow */
import type { Action } from "../../actionTypes";
import type { Node } from "./Stratifier";
import type { Program } from "../../interpreter/Parser";

export const onHoverNode = (node: Node): Action => ({
  type: "ast_view_node_hover",
  node: node,
});

export const onStopHoverNode = (): Action => ({
  type: "ast_view_node_hover_stop",
});

export const onClickNode = (node: Node): Action => ({
  type: "ast_view_node_click",
  node: node,
});

export const onReceiveAST = (ast: ?Program) => ({
  type: "ast_view_received_ast",
  ast: ast,
});
