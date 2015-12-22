import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route } from 'react-router'

import App from './components/App'

/*
  Routes
*/

var routes = (
  <Router>
    <Route path="/" component={App}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))
