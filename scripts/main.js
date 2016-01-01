import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link } from 'react-router'
//import createBrowserHistory from 'history/lib/createBrowserHistory'
import { createHistory, useBasename } from 'history'
import u from './utils'

import App from './components/App'
import Settings from './components/Settings'
import NotFound from './components/NotFound'

// This little nugget allows this to be served from a subdirectory, basically,
// if the pathname ends in a slash, we'll use that pathname as the base path.
// TODO This doesn't work well if someone messes around with the URL manually
var basePath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'))
var history
if(basePath.length > 0) {
  history = useBasename(createHistory)({
    basename: basePath
  })
} else {
  history = useBasename(createHistory)({
    basename: '/'
  })
}

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
  <Router history={history}>
    <Route path="/" component={localSettings() ? App : Settings} />
    <Route path="/settings" component={Settings} />
    <Route path="*" component={NotFound} />
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))
