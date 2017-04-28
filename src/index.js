/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';
import AppView from './AppView';
import './index.css';
import store from './store';
import { Provider } from 'react-redux';

ReactDOM.render(
  <Provider store={store}>
    <AppView />
  </Provider>,
  document.getElementById('root')
);
