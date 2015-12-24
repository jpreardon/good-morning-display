import React from 'react'
import CurrentConditions from './CurrentConditions'
import Forecast from './Forecast'

// TODO: This needs to go elsewhere, I might put it back in localStorage at some point, for now, I leave it
const WEATHER_API = 'http://api.wunderground.com/api/1197e676c4b523c6/conditions/forecast/hourly/q/11238.json'


class App extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className="row">
        <div id="weather-containter">
          <CurrentConditions weatherApi={WEATHER_API} />
          <Forecast />
        </div>
      </div>
    )
  }
}

export default App
