import React from 'react'
import u from '../utils.js'

class CurrentConditions extends React.Component {
  constructor(props) {
    super(props)
    this.state = { current : {}, icon_url : '' }
  }

  componentDidMount() {
    u.fetchData(this.props.weatherApi, result => {
      this.setState({
        current: result.current_observation,
        icon_url: `http://icons.wxug.com/i/c/i/${result.current_observation.icon}`
       })
    })
  }

  render() {
    return (
      <div className="current-weather">
        <div className="inner">
          <img className="weather-icon" src={this.state.icon_url} />
          <p className="temperature">{this.state.current.temp_f}º F</p>
          <p className="current-observation">{this.state.current.weather}</p>
          <p className="humidity-feel">Humidity {this.state.current.relative_humidity}, feels like {this.state.current.feelslike_string}</p>
        </div>
      </div>
    )
  }
}

export default CurrentConditions
