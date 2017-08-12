/* @flow */

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import "./index.css";
import InterpreterContainer from "../InterpreterPage";

const AppView = () =>
  <Router>
    <div className="App">
      <section />
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Redirect exact path="/" to="/interpreter" />}
        />
        <Route path="/interpreter" component={InterpreterContainer} />
      </Switch>
      <section />
    </div>
  </Router>;

export default AppView;
