import React from 'react'

class ForecastItem extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <li>
        <p>{this.props.day}<br />{this.props.time}</p>
        <img src={this.props.image_url} />
        <p>{this.props.temp}&deg;</p>
      </li>
    )
  }
}

export default ForecastItem
