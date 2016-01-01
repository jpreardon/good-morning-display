import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import u from './utils'

import App from './components/App'
import Settings from './components/Settings'

function localSettings() {
  if(u.localStorageIsSet('zipcode') && u.localStorageIsSet('weatherKey') && u.localStorageIsSet('transitLines', true)) {
    return true
  } else {
    return false
  }
}

/*
  Routes

  TODO We're forcing the user to settings if they don't have all of the
  required settings, which is a good thing. But, they way we are doing it
  probably isn't the best. It isn't very user friendly, and the URL
  doesn't change in the browser.
*/

var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={localSettings() ? App : Settings} />
    <Route path="/settings" component={Settings} />
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))
