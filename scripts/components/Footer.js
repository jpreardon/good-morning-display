import React from 'react'

class Footer extends React.Component {
  constructor() {
    super()
  }

  render() {
    return(
      <div className="footer">
        <p className="title">Good Morning Display</p>
        <a className="settings-link" href="settings"><img src='img/settings-icon.png' /></a>
      </div>
    )
  }
}

export default Footer
