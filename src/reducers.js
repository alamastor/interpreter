/* @flow */
import type {Action} from './actionTypes.js'
import * as Immutable from 'immutable'
import type { Token } from './interpreters/interpreter/Token'

const code = (state: string = '', action: Action) => {
  switch (action.type) {
    case 'code_update':
      return action.code

    default:
      return state
  }
}

const InterpreterState = Immutable.Record({
  interpreter: 6,
  output: '',
  grammar: [],
})

const interpreter = (
  state: InterpreterState = new InterpreterState(), action: Action
) => {
  switch (action.type) {
    case 'interpreter_version_update':
      return state.set('interpreterVersion', action.version)
    case 'interpreter_output_update':
      return state.set('output', action.output)
    case 'interpreter_grammar_update':
      return state.set('grammar', action.grammar)
    default:
      return state
  }
}

const tokenList = (state: Immutable.List<Token> = new Immutable.List(), action: Action) => {
  switch (action.type) {
    case 'token_list_reset':
      return new Immutable.List()
    case 'token_list_push':
      return state.push(action.token)
    default:
      return state
  }
}

export { code, interpreter, tokenList }