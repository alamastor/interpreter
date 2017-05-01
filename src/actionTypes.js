/* @flow */
'use strict';
import type { Token } from './interpreters/interpreter/Token'

export type Action = {
  type: 'code_update',
  code: string
} | {
  type: 'token_list_reset',
} | {
  type: 'token_list_push',
  token: Token
} | {
  type: 'interpreter_ver_update',
  ver: number
} | {
  type: 'interpreter_output_update',
  output: string
} | {
  type: 'interpreter_grammar_update',
  grammar: Array<string>
}
