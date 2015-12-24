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
      <div>
        <img className="WeatherIcon" src={this.state.icon_url} />
        <p className="CurrentTemp">{this.state.current.temp_f}º F</p>
        <p className="CurrentWeather">{this.state.current.weather}</p>
        <p className="FeelsLike">Feels like {this.state.current.feelslike_string}</p>
      </div>
    )
  }
}

export default CurrentConditions
