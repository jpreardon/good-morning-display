import React from 'react'

class CurrentConditions extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="current-weather">
        <div className="inner">
          <img className="weather-icon" src={this.props.icon_url} />
          <p className="current-observation">{String(this.props.current.weather).toLowerCase()}</p>
          <p className="temperature">{this.props.current.feelslike_f}&deg;</p>
          <p className="wind">{this.props.current.wind_string}</p>
        </div>
      </div>
    )
  }
}

export default CurrentConditions
