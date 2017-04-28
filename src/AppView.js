/* @flow */

import React from 'react';
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
    <div className="App">
      <section/>
      <Switch>
        <Route exact path="/" render={
          () => <Redirect exact path="/" to="/interpreter"/>
        }/>
        <Route path="/interpreter/:id" component={InterpreterContainer}/>
        <Route path="/interpreter" component={InterpreterContainer}/>
      </Switch>
      <section>
        <div className="interpreters">
          <h4>Interpreters</h4>
          <h5>Pascal</h5>
          <ul className="interpreter-list">
            { [1, 2, 3, 4, 5].map(x => (
              <li key={x} className="interpreter-link">
                <Link to={ "/interpreter/" + x }>V{ x }</Link>
              </li>
            )) }
          </ul>
        </div>
      </section>
    </div>
  </Router>
)

export default AppView;