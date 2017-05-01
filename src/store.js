/* @flow */
import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { code, tokenList, interpreter } from './reducers'

const reducer = combineReducers({
  code,
  interpreter,
  tokenList,
})

const store = createStore(
  reducer,
  applyMiddleware(thunk)
)

export default store;