import React from 'react'

class ForecastItem extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <li key={this.props.key}>
        <p className="day-time">{this.props.day}<br />{this.props.time}</p>
        <img className="mini-icon" src={this.props.image_url} />
        <p>{this.props.temp}&deg;</p>
      </li>
    )
  }
}

export default ForecastItem
