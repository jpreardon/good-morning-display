import React from 'react'
import u from '../utils.js'
import CurrentConditions from './CurrentConditions'
import Forecast from './Forecast'
import UpdateTime from './UpdateTime'

// TODO: This needs to go elsewhere, I might put it back in localStorage at some point, for now, I leave it
const WEATHER_API = 'http://api.wunderground.com/api/1197e676c4b523c6/conditions/forecast/hourly/q/11238.json'

// Update frequency constants
const WEATHER_UPDATE_FREQ = 1800000 // In milliseconds (every 30 minutes)
const TRANSIT_UPDATE_FREQ = 120000 // In milliseconds (every 2 minutes)

class App extends React.Component {
  constructor() {
    super()
    this.state = { current : {}, icon_url : '', forecasts : [], updateTime : '' }
  }

  loadDataFromServer() {
    u.fetchData(WEATHER_API, (result) => {
      this.setState({
        current: result.current_observation,
        icon_url: `http://icons.wxug.com/i/c/i/${result.current_observation.icon}`,
        forecasts: result.hourly_forecast,
        updateTime: new Date().toLocaleTimeString()
      })
    })
  }

  componentDidMount() {
    this.loadDataFromServer()
    setInterval(this.loadDataFromServer.bind(this), WEATHER_UPDATE_FREQ)
  }

  render() {
    return (
      <div>
        <CurrentConditions current={this.state.current} icon_url={this.state.icon_url} />
        <Forecast forecasts={this.state.forecasts} />
        <UpdateTime time={this.state.updateTime} />
      </div>
    )
  }
}

export default App
