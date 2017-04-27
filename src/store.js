/* @flow */
import { combineReducers, createStore } from 'redux'

import { code } from './reducers'

const reducer = combineReducers({
  code,
})

const store = createStore(
  reducer,
)

export default store;