import React from 'react'
import { Link } from 'react-router'

class NotFound extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return(
      <div>
        <h1>404</h1>
        <p>Whatever you're looking for isn't here. Try <Link to='/'>navigating back to the
        dashboard.</Link></p>
      </div>
    )
  }
}

export default NotFound
