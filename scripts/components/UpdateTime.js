import React from 'react'

class UpdateTime extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="updated">
        <p className="updated-time">as of {this.props.time}</p>
      </div>
    )
  }


}

export default UpdateTime
