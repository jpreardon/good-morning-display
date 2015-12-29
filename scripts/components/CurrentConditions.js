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
          <p className="temperature">{this.props.current.temp_f}&deg; F</p>
          <p className="current-observation">{this.props.current.weather}</p>
          <p className="humidity-feel">Humidity {this.props.current.relative_humidity}, feels like {this.props.current.feelslike_string}</p>
        </div>
      </div>
    )
  }
}

export default CurrentConditions
