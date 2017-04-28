/* @flow */

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link,
} from 'react-router-dom';
import './App.css';
import InterpreterContainer from './InterpreterContainer';

const AppView = () => (
  <Router>
    <div>
      <ul>
        { [1, 2].map(x => (
          <li key={x}>
            <Link to={ "/interpreter/" + x }>V{ x }</Link>
          </li>
        )) }
      </ul>
      <Switch>
        <Route exact path ="/" render={
          () => <Redirect exact path="/" to ="/interpreter"/>
        }/>
        <Route path="/interpreter/:id" component={InterpreterContainer}/>
        <Route path="/interpreter" component={InterpreterContainer}/>
      </Switch>
    </div>
  </Router>
)

export default AppView;