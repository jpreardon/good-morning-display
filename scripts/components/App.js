import React from 'react'
import u from '../utils.js'

// TODO: This needs to go elsewhere, I might put it back in localStorage at some point, for now, I leave it
const WEATHER_API = 'http://api.wunderground.com/api/1197e676c4b523c6/conditions/forecast/hourly/q/11238.json'


class App extends React.Component {
  constructor() {
    super()
    this.state = { current : {}, icon_url : '' }
  }

  componentDidMount() {
    u.fetchData(WEATHER_API, result => {
      this.setState({
        current: result.current_observation,
        icon_url: `http://icons.wxug.com/i/c/i/${result.current_observation.icon}`
       })
    })
  }

  render() {
    return (
      <div>
        <img className="WeatherIcon" src={this.state.icon_url} />
        <p className="CurrentTemp">{this.state.current.temp_f}º F</p>
        <p className="CurrentWeather">{this.state.current.weather}</p>
        <p className="FeelsLike">Feels like {this.state.current.feelslike_string}</p>
      </div>
    )
  }
}

export default App
