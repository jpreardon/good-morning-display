import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'

import App from './components/App'
import Settings from './components/Settings'

/*
  Routes
*/

var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App} />
    <Route path="/settings" component={Settings} />
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))
