import React from 'react'
import { Link } from 'react-router'

class Footer extends React.Component {
  constructor() {
    super()
  }

  render() {
    return(
      <div className="footer">
        <p className="title">Good Morning Display</p>
        <Link to='/settings' className="settings-link"><img src='build/img/settings-icon.png' /></Link>
      </div>
    )
  }
}

export default Footer
