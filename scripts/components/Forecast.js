import React from 'react'
import ForecastItem from './ForecastItem'

class Forecast extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    var forecastCount = 1
    var ourForecasts = []

    // TODO: This seems like it should be a callback function for the return
    // statement below.
    this.props.forecasts.forEach( function(forecast) {
      if (forecast.FCTTIME.hour == "9" || forecast.FCTTIME.hour == "13" || forecast.FCTTIME.hour == "17") {
        if (forecastCount < 4) {
          ourForecasts.push({
            weekday: forecast.FCTTIME.weekday_name_abbrev.toUpperCase(),
            time: `${forecast.FCTTIME.hour_padded}:00`,
            imageUrl: `http://icons.wxug.com/i/c/j/${forecast.icon}`,
            temp: forecast.temp.english
          })
        }
      }
    })

    return (
      <div className="forecast-weather">
        <ul>
          {ourForecasts.map( function(forecast) {
            return (
              <ForecastItem
                key={forecast.weekday+forecast.time}
                day={forecast.weekday}
                time={forecast.time}
                image_url={forecast.imageUrl}
                temp={forecast.temp}
              />
            )
          })}
        </ul>
      </div>
    )
  }
}

export default Forecast
