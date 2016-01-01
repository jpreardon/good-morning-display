import React from 'react'
import u from '../utils.js'
import CurrentConditions from './CurrentConditions'
import Forecast from './Forecast'
import UpdateTime from './UpdateTime'
import TransitStatus from './TransitStatus'
import Footer from './Footer'

// TODO: Redirect to settings if the weatherKey and zipcode don't exist in local storage
const WEATHER_API = `http://api.wunderground.com/api/${localStorage.weatherKey}/conditions/forecast/hourly/q/${localStorage.zipcode}.json`
const TRANSIT_API = 'http://jpreardon.com/gmd/cgi-bin/service_status.py'

// Update frequency constants
const WEATHER_UPDATE_FREQ = 1800000 // In milliseconds (every 30 minutes)
const TRANSIT_UPDATE_FREQ = 120000 // In milliseconds (every 2 minutes)

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      current : {},
      icon_url : '',
      forecasts : [],
      weatherUpdateTime : '',
      transit : [],
      transitUpdateTime : ''
     }
  }

  loadWeatherData() {
    u.fetchData(WEATHER_API, (result) => {
      this.setState({
        current: result.current_observation,
        icon_url: `http://icons.wxug.com/i/c/i/${result.current_observation.icon}`,
        forecasts: result.hourly_forecast,
        weatherUpdateTime: new Date().toLocaleTimeString()
      })
    })
  }

  loadTransitData() {
    u.fetchData(TRANSIT_API, (result) => {
      this.setState({
        transit: result,
        transitUpdateTime: new Date().toLocaleTimeString()
      })
    })
  }

  refreshData() {
    var date = new Date()
  	// Update the weather information, if needed
  	if ((!localStorage.getItem("lastWeatherUpdate")) || (Number(localStorage.lastWeatherUpdate) + WEATHER_UPDATE_FREQ < date.getTime())) {
  		// Update weather!
  		this.loadWeatherData()
  		// Set the last update time
  		localStorage.lastWeatherUpdate = date.getTime()
  	}

  	// Update the transit information, if needed
  	if ((!localStorage.getItem("lastTransitUpdate")) || (Number(localStorage.lastTransitUpdate) + TRANSIT_UPDATE_FREQ < date.getTime())) {
  		// Update transit!
  		this.loadTransitData()
  		// Set the last update time
  		localStorage.lastTransitUpdate = date.getTime()
  	}
  }

  componentDidMount() {
    this.loadWeatherData()
    this.loadTransitData()
    setInterval(this.refreshData.bind(this), 1000)
  }

  render() {
    return (
      <div className="app-container">
        <div className="weather-container">
          <CurrentConditions current={this.state.current} icon_url={this.state.icon_url} />
          <Forecast forecasts={this.state.forecasts} />
        </div>
        <UpdateTime time={this.state.weatherUpdateTime} />
        <div className="transit-container">
          <TransitStatus transitStatus={this.state.transit}/>
        </div>
        <UpdateTime time={this.state.transitUpdateTime} />
        <Footer />
      </div>
    )
  }
}

export default App
