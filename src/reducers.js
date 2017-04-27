/* @flow */
import type {Action} from './actionTypes.js';

const code = (state: string = '', action: Action) => {
  switch (action.type) {
    case 'code_update':
      return action.code

    default:
      return state
  }
}

export { code }