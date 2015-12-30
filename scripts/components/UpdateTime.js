import React from 'react'

class UpdateTime extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <p className="updated-time">as of {this.props.time}</p>
    )
  }


}

export default UpdateTime
